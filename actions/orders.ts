'use server';

import { getAuthenticatedCustomer } from '@/lib/db/customer-helper';

export async function getUserOrders() {
  try {
    const authData = await getAuthenticatedCustomer();
    if (!authData) {
      return { success: false, error: 'Unauthenticated', orders: [] };
    }

    const { customer, supabaseAdmin } = authData;

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        payment_status,
        total_cents,
        shipping_cents,
        tax_cents,
        discount_cents,
        created_at,
        shipping_address,
        order_items (
          id,
          variant_id,
          quantity,
          unit_price_cents,
          total_price_cents,
          product_variants (
            id,
            sku,
            name,
            price_cents,
            product_images ( image_url ),
            products:product_id ( id, name, slug )
          )
        )
      `)
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[GET USER ORDERS ERROR]:', error);
      return { success: false, error: error.message, orders: [] };
    }

    return { success: true, orders: orders || [] };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
    return { success: false, error: errorMessage, orders: [] };
  }
}

export async function getOrderById(orderId: string) {
  try {
    const authData = await getAuthenticatedCustomer();
    if (!authData) {
      return { success: false, error: 'Unauthenticated', order: null };
    }

    const { customer, supabaseAdmin } = authData;

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        payment_status,
        total_cents,
        shipping_cents,
        tax_cents,
        discount_cents,
        created_at,
        shipping_address,
        billing_address,
        tracking_number,
        carrier,
        order_items (
          id,
          variant_id,
          quantity,
          unit_price_cents,
          total_price_cents,
          product_variants (
            id,
            sku,
            name,
            price_cents,
            product_images ( image_url ),
            products:product_id ( id, name, slug )
          )
        )
      `)
      .eq('id', orderId)
      .eq('customer_id', customer.id)
      .single();

    if (error || !order) {
      console.error('[GET ORDER BY ID ERROR]:', error);
      return { success: false, error: error?.message || 'Order not found', order: null };
    }

    return { success: true, order };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch order details';
    return { success: false, error: errorMessage, order: null };
  }
}
