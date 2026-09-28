'use server';

import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabase/server';

// Fetch user orders by Clerk UserId via customers table join
export async function getMyOrders(userId: string) {
  try {
    if (!userId) return [];

    const { data: customer, error: custErr } = await supabaseServer
      .from("customers")
      .select("id")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (custErr || !customer) {
      // Fallback query directly on orders table if customer record is pending
      const { data: directOrders } = await supabaseServer
        .from("orders")
        .select("*")
        .eq("clerk_user_id", userId)
        .order("created_at", { ascending: false });

      return directOrders || [];
    }

    const { data, error } = await supabaseServer
      .from("orders")
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
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching user orders from Supabase:", error);
    return [];
  }
}

export async function fetchMyOrdersAction() {
  try {
    const { userId } = await auth();
    if (!userId) return [];
    return await getMyOrders(userId);
  } catch (err) {
    console.error('Error fetching orders action:', err);
    return [];
  }
}
