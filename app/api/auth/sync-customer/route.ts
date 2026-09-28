import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    // 1. Session Verification (Prevent unauthenticated customer upsert / IDOR)
    const { userId: authedUserId } = await auth();
    if (!authedUserId) {
      return NextResponse.json(
        { error: 'Unauthorized: Valid Clerk session required' },
        { status: 401 }
      );
    }

    // 2. Parse Body Safely
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { userId, firstName, lastName, phone } = body || {};

    // 3. Reject Mismatched Identity Payloads
    if (userId && userId !== authedUserId) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot sync user profile for another user identity' },
        { status: 403 }
      );
    }

    // 4. Retrieve Verified Identity Details from Clerk
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized: Unable to resolve active user profile' },
        { status: 401 }
      );
    }

    const primaryEmail =
      clerkUser.emailAddresses?.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ||
      clerkUser.emailAddresses?.[0]?.emailAddress;

    if (!primaryEmail) {
      return NextResponse.json(
        { error: 'Missing verified email address from auth provider' },
        { status: 400 }
      );
    }

    const resolvedFirstName = firstName || clerkUser.firstName || '';
    const resolvedLastName = lastName || clerkUser.lastName || '';
    const resolvedPhone = phone || clerkUser.phoneNumbers?.[0]?.phoneNumber || null;

    // 5. Secure Admin Upsert into customers Table
    const { data, error } = await supabaseAdmin
      .from('customers')
      .upsert(
        {
          clerk_user_id: authedUserId,
          email: primaryEmail.trim().toLowerCase(),
          first_name: resolvedFirstName,
          last_name: resolvedLastName,
          phone: resolvedPhone,
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
