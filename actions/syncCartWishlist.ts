'use server';

import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function syncCartAndWishlistOnLogin(guestSessionToken: string | null) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Unauthenticated' };
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Resolve Customer ID
  const { data: customer, error: customerError } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  if (customerError || !customer) {
    console.warn('[SYNC CART] Customer record not ready yet:', customerError);
    return { success: false, error: 'Customer not found' };
  }

  const customerId = customer.id;

  // 2. Migrate Guest Cart Items (if guestSessionToken provided)
  if (guestSessionToken) {
    const { data: guestCart } = await supabaseAdmin
      .from('carts')
      .select('id, cart_items ( variant_id, quantity )')
      .eq('session_token', guestSessionToken)
      .maybeSingle();

    if (guestCart && guestCart.cart_items && guestCart.cart_items.length > 0) {
      // Find or create customer cart
      let { data: userCart } = await supabaseAdmin
        .from('carts')
        .select('id')
        .eq('customer_id', customerId)
        .maybeSingle();

      if (!userCart) {
        const { data: newCart } = await supabaseAdmin
          .from('carts')
          .insert({ customer_id: customerId })
          .select('id')
          .single();
        userCart = newCart;
      }

      if (userCart) {
        for (const item of guestCart.cart_items) {
          const { data: existingItem } = await supabaseAdmin
            .from('cart_items')
            .select('id, quantity')
            .eq('cart_id', userCart.id)
            .eq('variant_id', item.variant_id)
            .maybeSingle();

          if (existingItem) {
            await supabaseAdmin
              .from('cart_items')
              .update({ quantity: existingItem.quantity + item.quantity })
              .eq('id', existingItem.id);
          } else {
            await supabaseAdmin
              .from('cart_items')
              .insert({
                cart_id: userCart.id,
                variant_id: item.variant_id,
                quantity: item.quantity,
              });
          }
        }

        // Clean up temporary guest cart
        await supabaseAdmin.from('carts').delete().eq('id', guestCart.id);
      }
    }
  }

  // 3. Fetch Active User Cart Items
  const { data: activeUserCart } = await supabaseAdmin
    .from('carts')
    .select(`
      id,
      cart_items (
        id,
        variant_id,
        quantity,
        product_variants (
          id,
          sku,
          name,
          price_cents,
          compare_at_price_cents,
          product_images ( image_url ),
          products:product_id ( id, name, slug )
        )
      )
    `)
    .eq('customer_id', customerId)
    .maybeSingle();

  // 4. Fetch Active User Wishlist
  const { data: activeWishlist } = await supabaseAdmin
    .from('wishlists')
    .select(`
      id,
      wishlist_items (
        id,
        variant_id
      )
    `)
    .eq('customer_id', customerId)
    .maybeSingle();

  return {
    success: true,
    cart: activeUserCart?.cart_items || [],
    wishlist: activeWishlist?.wishlist_items || [],
  };
}
