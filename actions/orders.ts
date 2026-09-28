'use server';

import { getAuthenticatedCustomer } from '@/lib/db/customer-helper';
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { sanitizeProductTitle } from '@/lib/utils';
import type { CustomerOrderOption } from '@/types/contact';

export type { CustomerOrderOption };

export interface EnrichedOrderItem {
  id: number;
  quantity: number;
  unit_price_cents: number;
  title: string;
  variant_name: string | null;
  slug: string;
  image_url: string;
  warranty_months?: number;
  variant_id?: number;
}

export interface EnrichedOrder {
  id: number;
  order_number: string;
  created_at: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  payment_status: string;
  total_amount_cents: number;
  shipping_amount_cents?: number;
  tax_amount_cents?: number;
  discount_amount_cents?: number;
  shipping_address_snapshot: {
    recipient_name?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    phone?: string;
    carrier?: string;
    tracking_number?: string;
    estimated_delivery?: string;
  } | null;
  items: EnrichedOrderItem[];
}

/**
 * Retrieves deep relational orders with fully normalized items for the authenticated customer.
 */
export async function getCustomerOrdersAction(): Promise<{
  success: boolean;
  error?: string;
  orders: EnrichedOrder[];
}> {
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
        tax_amount_cents,
        discount_amount_cents,
        shipping_address_snapshot,
        created_at,
        order_items (
          id,
          variant_id,
          quantity,
          unit_price_cents,
          warranty_months,
          product_variants (
            id,
            sku,
            name,
            price_cents,
            product_images (
              image_url,
              is_featured,
              sort_order
            ),
            products:product_id (
              id,
              name,
              slug
            )
          )
        )
      `)
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[GET CUSTOMER ORDERS ERROR]:', error);
      return { success: false, error: error.message, orders: [] };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enrichedOrders: EnrichedOrder[] = (orders || []).map((o: any) => {
      // Normalize items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items: EnrichedOrderItem[] = (o.order_items || []).map((oi: any) => {
        const variant = oi.product_variants;
        const product = variant?.products;
        const rawTitle = product?.name || variant?.name || 'Electronics Product';
        const { title } = sanitizeProductTitle(rawTitle);

        // Resolve primary/featured image with fallback
        let imageUrl =
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';
        if (Array.isArray(variant?.product_images) && variant.product_images.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const featured = variant.product_images.find((img: any) => img.is_featured);
          imageUrl = (featured || variant.product_images[0])?.image_url || imageUrl;
        }

        return {
          id: oi.id,
          quantity: oi.quantity || 1,
          unit_price_cents: oi.unit_price_cents || 0,
          title,
          variant_name: variant?.name || null,
          slug: product?.slug || String(product?.id || variant?.id || ''),
          image_url: imageUrl,
          warranty_months: oi.warranty_months || 12,
          variant_id: oi.variant_id || variant?.id,
        };
      });

      return {
        id: o.id,
        order_number: o.order_number,
        created_at: o.created_at,
        status: (o.status || 'processing') as EnrichedOrder['status'],
        payment_status: o.payment_status || 'paid',
        total_amount_cents: o.total_amount_cents || 0,
        shipping_amount_cents: o.shipping_amount_cents || 0,
        tax_amount_cents: o.tax_amount_cents || 0,
        discount_amount_cents: o.discount_amount_cents || 0,
        shipping_address_snapshot: o.shipping_address_snapshot || null,
        items,
      };
    });

    return { success: true, orders: enrichedOrders };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch customer orders';
    return { success: false, error: errorMessage, orders: [] };
  }
}

export async function getUserOrders() {
  return await getCustomerOrdersAction();
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

