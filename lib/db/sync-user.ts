import { createClient } from '@supabase/supabase-js';

export async function syncUserToSupabase(user: {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('[DATABASE SYNC ERROR]: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    throw new Error('Missing Supabase service role credentials');
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);

  const { data, error } = await supabaseAdmin
    .from('customers')
    .upsert(
      {
        clerk_user_id: user.id,
        email: user.email,
        first_name: user.firstName || '',
        last_name: user.lastName || '',
        phone: user.phone || null,
        is_active: true,
      },
      { onConflict: 'clerk_user_id' }
    )
    .select()
    .single();

  if (error) {
    console.error('[DATABASE SYNC ERROR]:', error);
    throw error;
  }

  console.log('[DATABASE SYNC SUCCESS]: Customer saved ->', data.email, `(${data.clerk_user_id})`);
  return data;
}
