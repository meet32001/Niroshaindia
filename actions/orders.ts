'use server';

import { getAuthenticatedCustomer } from '@/lib/db/customer-helper';
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { CustomerOrderOption } from '@/types/contact';

export type { CustomerOrderOption };


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

export async function getCustomerOrdersForSelectAction(userEmail?: string): Promise<{
  success: boolean;
  orders: CustomerOrderOption[];
  message?: string;
}> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !serviceKey) {
      return { success: false, orders: [], message: 'Database configuration missing' };
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // 1. Identify customer email via Clerk currentUser() or passed userEmail
    let email = userEmail;
    let userId: string | undefined;

    if (!email) {
      try {
        const user = await currentUser();
        email = user?.emailAddresses?.[0]?.emailAddress;
        userId = user?.id;
      } catch {
        // Guest or unauthenticated request
      }
    }

    if (!email && !userId) {
      return { success: true, orders: [] };
    }

    // 2. Fetch customer row
    let customer: { id: string | number } | null = null;
    if (email) {
      const { data } = await supabase
        .from('customers')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      customer = data;
    }

    if (!customer && userId) {
      const { data } = await supabase
        .from('customers')
        .select('id')
        .eq('clerk_user_id', userId)
        .maybeSingle();
      customer = data;
    }

    if (!customer) {
      return { success: true, orders: [] };
    }

    // 3. Retrieve their recent orders (limit to last 15 orders)
    const { data: orders, error } = await supabase
      .from('orders')
      .select('order_number, created_at, status, total_amount_cents')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
      .limit(15);

    if (error) throw error;

    return {
      success: true,
      orders: (orders || []).map((ord) => ({
        order_number: ord.order_number,
        created_at: ord.created_at,
        status: ord.status,
        total_amount_cents: ord.total_amount_cents || 0,
      })),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Failed to load customer orders for contact form:', err);
    return { success: false, orders: [], message: errorMsg };
  }
}

