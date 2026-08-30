import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email, firstName, lastName, phone } = body;

    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing userId or email' }, { status: 400 });
    }

    console.log('[API SYNC] Writing customer to Supabase:', { userId, email });

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabaseAdmin
      .from('customers')
      .upsert(
        {
          clerk_user_id: userId,
          email,
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          is_active: true,
        },
        { onConflict: 'clerk_user_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('[API SYNC DATABASE ERROR]:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[API SYNC SUCCESS]: Customer saved:', data);
    return NextResponse.json({ success: true, customer: data }, { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Sync failed';
    console.error('[API SYNC FATAL]:', err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
