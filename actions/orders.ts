'use server';

import { getAuthenticatedCustomer } from '@/lib/db/customer-helper';
import { z } from 'zod';

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
        total_amount_cents,
        shipping_amount_cents,
        created_at,
        order_items (
          id,
          variant_id,
          quantity,
          unit_price_cents,
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

    const formattedOrders = (orders || []).map((o) => ({
      ...o,
      total_cents: o.total_amount_cents,
      shipping_cents: o.shipping_amount_cents,
      tax_cents: 0,
      discount_cents: 0,
    }));

    return { success: true, orders: formattedOrders };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
    return { success: false, error: errorMessage, orders: [] };
  }
}

const orderIdSchema = z.string().min(1, 'Order ID is required');

export async function getOrderById(orderId: string) {
  try {
    const parseResult = orderIdSchema.safeParse(orderId);
    if (!parseResult.success) {
      return { success: false, error: 'Invalid Order ID', order: null };
    }

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
        total_amount_cents,
        shipping_amount_cents,
        created_at,
        order_items (
          id,
          variant_id,
          quantity,
          unit_price_cents,
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
      .eq('id', parseResult.data)
      .eq('customer_id', customer.id)
      .single();


    if (error || !order) {
      console.error('[GET ORDER BY ID ERROR]:', error);
      return { success: false, error: error?.message || 'Order not found', order: null };
    }

    const formattedOrder = {
      ...order,
      total_cents: order.total_amount_cents,
      shipping_cents: order.shipping_amount_cents,
      tax_cents: 0,
      discount_cents: 0,
    };

    return { success: true, order: formattedOrder };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch order details';
    return { success: false, error: errorMessage, order: null };
  }
}
