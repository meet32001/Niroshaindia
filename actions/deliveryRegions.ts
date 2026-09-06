'use server';

import { createClient } from '@supabase/supabase-js';
import { INDIAN_STATES, STATE_CITIES_MAP } from '@/lib/constants/regions';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  return createClient(supabaseUrl, serviceKey);
}

export async function seedDeliveryRegions() {
  try {
    const supabase = getAdminClient();

    // 1. Prepare states data
    const statesToInsert = INDIAN_STATES.map((stateName) => ({
      name: stateName,
      code: stateName.substring(0, 3).toUpperCase(),
      is_active: true,
    }));

    // Upsert or insert states
    const { data: insertedStates, error: stateError } = await supabase
      .from('delivery_states')
      .upsert(statesToInsert, { onConflict: 'name', ignoreDuplicates: true })
      .select('id, name');

    if (stateError) {
      console.error('[SEED STATES ERROR]:', stateError);
    }

    // Fetch all states to guarantee state name -> id mapping
    const { data: allStates } = await supabase
      .from('delivery_states')
      .select('id, name');

    if (!allStates || allStates.length === 0) {
      return { success: false, error: 'Failed to retrieve delivery states for seeding' };
    }

    const stateMap = new Map<string, string>();
    allStates.forEach((s) => stateMap.set(s.name, s.id));

    // 2. Prepare cities data
    const citiesToInsert: { state_id: string; name: string; is_active: boolean }[] = [];

    for (const [stateName, cityList] of Object.entries(STATE_CITIES_MAP)) {
      const stateId = stateMap.get(stateName);
      if (stateId) {
        cityList.forEach((cityName) => {
          citiesToInsert.push({
            state_id: stateId,
            name: cityName,
            is_active: true,
          });
        });
      }
    }

    if (citiesToInsert.length > 0) {
      const { error: cityError } = await supabase
        .from('delivery_cities')
        .upsert(citiesToInsert, { onConflict: 'state_id,name', ignoreDuplicates: true });

      if (cityError) {
        // Fallback: insert individually or batch without unique constraint assuming basic schema
        console.warn('[SEED CITIES NOTICE]:', cityError.message);
        await supabase.from('delivery_cities').insert(citiesToInsert);
      }
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to seed delivery regions';
    console.error('[SEED REGIONS EXCEPTION]:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function getActiveDeliveryRegions() {
  try {
    const supabase = getAdminClient();

    let { data: states, error: statesError } = await supabase
      .from('delivery_states')
      .select('id, name, code, is_active')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (statesError || !states || states.length === 0) {
      console.log('[DELIVERY REGIONS]: No states found in database, seeding default Indian states and cities...');
      await seedDeliveryRegions();
      const retryResult = await supabase
        .from('delivery_states')
        .select('id, name, code, is_active')
        .eq('is_active', true)
        .order('name', { ascending: true });
      states = retryResult.data || [];
    }

    const { data: cities, error: citiesError } = await supabase
      .from('delivery_cities')
      .select('id, state_id, name, is_active')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (citiesError) {
      console.error('[GET CITIES ERROR]:', citiesError);
    }

    return {
      success: true,
      states: states || [],
      cities: cities || [],
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch delivery regions';
    console.error('[GET REGIONS EXCEPTION]:', errorMessage);
    return { success: false, error: errorMessage, states: [], cities: [] };
  }
}
