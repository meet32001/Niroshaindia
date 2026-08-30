'use server';

import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabase/server';

export interface CartItemSyncInput {
  productId: string;
  variantId: string;
  quantity: number;
}

export async function syncUserCartAction(
  guestToken: string,
  localItems: CartItemSyncInput[]
) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthenticated' };

    // 1. Fetch Supabase customer record
    const { data: customer } = await supabaseServer
      .from('customers')
      .select('id')
      .eq('clerk_user_id', userId)
      .maybeSingle();

    if (!customer?.id) {
      return { success: false, error: 'Customer not found' };
    }

    const customerId = customer.id;

    // 2. Link guest cart session records in `carts` table to customer_id
    if (guestToken) {
      await supabaseServer
        .from('carts')
        .update({ customer_id: customerId })
        .eq('session_token', guestToken);
    }

    // 3. Find or create active customer cart in `carts`
    let { data: activeCart } = await supabaseServer
      .from('carts')
      .select('id')
      .eq('customer_id', customerId)
      .maybeSingle();

    if (!activeCart) {
      const { data: newCart } = await supabaseServer
        .from('carts')
        .insert([{ customer_id: customerId, session_token: guestToken, status: 'ACTIVE' }])
        .select('id')
        .single();
      activeCart = newCart;
    }

    const cartId = activeCart?.id;

    // 4. Merge guest items into Supabase `cart_items`
    if (cartId && Array.isArray(localItems) && localItems.length > 0) {
      for (const item of localItems) {
        const rawVariantId = item.variantId || item.productId;
        if (!rawVariantId) continue;

        // Try numeric conversion if it's a numeric variant ID
        const variantId = !isNaN(Number(rawVariantId))
          ? Number(rawVariantId)
          : rawVariantId;

        const { data: existingCartItem } = await supabaseServer
          .from('cart_items')
          .select('id, quantity')
          .eq('cart_id', cartId)
          .eq('variant_id', variantId)
          .maybeSingle();

        if (existingCartItem) {
          await supabaseServer
            .from('cart_items')
            .update({ quantity: Math.max(existingCartItem.quantity, item.quantity) })
            .eq('id', existingCartItem.id);
        } else {
          await supabaseServer.from('cart_items').insert([
            {
              cart_id: cartId,
              variant_id: variantId,
              quantity: item.quantity,
            },
          ]);
        }
      }
    }

    return { success: true, cartId };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Sync failed';
    console.error('Cart sync error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
