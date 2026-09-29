'use server';

import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabase/server';

/**
 * Internal helper — NOT exported. Fetches orders only after the caller
 * has verified sessionUserId === the current Clerk session.
 */
async function _fetchOrdersForVerifiedUser(sessionUserId: string) {
  const { data: customer, error: custErr } = await supabaseServer
    .from('customers')
    .select('id')
    .eq('clerk_user_id', sessionUserId)
    .maybeSingle();

  if (custErr || !customer) {
    // Fallback: query directly on orders table if customer row is still being synced
    const { data: directOrders } = await supabaseServer
      .from('orders')
      .select('*')
      .eq('clerk_user_id', sessionUserId)
      .order('created_at', { ascending: false });
    return directOrders || [];
  }

  const { data, error } = await supabaseServer
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product_variants (
          name,
          sku,
          product_images ( image_url )
        )
      )
    `)
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false });

  if (!error && Array.isArray(data)) {
    return data;
  }
  return [];
}

/**
 * IDOR-safe wrapper: callers can pass a userId hint (e.g. from a client store),
 * but the server always re-reads the session and ignores the hint if it mismatches.
 * This prevents any authenticated user from passing a foreign userId to read
 * another user's orders (horizontal privilege escalation).
 */
export async function getMyOrders(userId: string) {
  try {
    const { userId: sessionUserId } = await auth();
    if (!sessionUserId) return [];

    // Reject if the caller-supplied hint doesn't match the session identity.
    if (userId && userId !== sessionUserId) {
      console.warn(
        `[IDOR BLOCK] getMyOrders called with userId=${userId} but session is ${sessionUserId}`
      );
      return [];
    }

    return await _fetchOrdersForVerifiedUser(sessionUserId);
  } catch (error) {
    console.error('Error fetching user orders from Supabase:', error);
    return [];
  }
}

/**
 * Primary action used by pages — always resolves userId from the session.
 */
export async function fetchMyOrdersAction() {
  try {
    const { userId } = await auth();
    if (!userId) return [];
    return await _fetchOrdersForVerifiedUser(userId);
  } catch (err) {
    console.error('Error fetching orders action:', err);
    return [];
  }
}

