import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Environment Variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[SYNC CUSTOMER ERROR] Missing SUPABASE environment variables:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!serviceRoleKey,
      });
      return NextResponse.json(
        { error: 'Server configuration error: missing Supabase keys' },
        { status: 500 }
      );
    }

    // 2. Parse Body Safely
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { userId, email, firstName, lastName, phone } = body || {};

    if (!userId || !email) {
      console.warn('[SYNC CUSTOMER WARN] Missing required fields:', { userId, email });
      return NextResponse.json({ error: 'Missing required fields: userId or email' }, { status: 400 });
    }

    // 3. Initialize Admin Client
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 4. Upsert into customers table
    const { data, error } = await supabaseAdmin
      .from('customers')
      .upsert(
        {
          clerk_user_id: userId,
          email: email.trim().toLowerCase(),
          first_name: firstName || '',
          last_name: lastName || '',
          phone: phone || null,
          is_active: true,
        },
        { onConflict: 'clerk_user_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('[SYNC CUSTOMER DB ERROR]:', error);
      return NextResponse.json({ error: error.message, details: error.details }, { status: 500 });
    }

    console.log('[SYNC CUSTOMER SUCCESS]: Synced user', data.email, `(${data.clerk_user_id})`);
    return NextResponse.json({ success: true, customer: data }, { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('[SYNC CUSTOMER UNCAUGHT EXCEPTION]:', err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
