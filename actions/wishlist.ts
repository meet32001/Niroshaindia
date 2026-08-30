'use server';

import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}

export async function getWishlistItems() {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized', items: [] };

    const supabase = getSupabaseAdmin();

    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (!customer) return { success: false, error: 'Customer not found', items: [] };

    const { data: wishlist } = await supabase
      .from('wishlists')
      .select(`
        id,
        wishlist_items (
          id,
          variant_id,
          created_at,
          product_variants (
            id,
            sku,
            name,
            price_cents,
            compare_at_price_cents,
            stock,
            product_images ( image_url ),
            products:product_id ( id, name, slug, price, discount )
          )
        )
      `)
      .eq('customer_id', customer.id)
      .maybeSingle();

    return { success: true, items: wishlist?.wishlist_items || [] };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch wishlist';
    return { success: false, error: errorMessage, items: [] };
  }
}

export async function toggleWishlistItem(variantId?: string | number | null) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized', isInWishlist: false };

    const numericVariantId = Number(variantId);
    if (!variantId || isNaN(numericVariantId)) {
      return { success: false, error: 'Invalid Variant ID', isInWishlist: false };
    }

    const supabase = getSupabaseAdmin();

    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (!customer) return { success: false, error: 'Customer not found', isInWishlist: false };

    let { data: wishlist } = await supabase
      .from('wishlists')
      .select('id')
      .eq('customer_id', customer.id)
      .maybeSingle();

    if (!wishlist) {
      const { data: newWishlist } = await supabase
        .from('wishlists')
        .insert({ customer_id: customer.id, name: 'My Wishlist' })
        .select('id')
        .single();
      wishlist = newWishlist;
    }

    if (!wishlist) return { success: false, error: 'Wishlist not found', isInWishlist: false };

    const { data: existingItem } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('wishlist_id', wishlist.id)
      .eq('variant_id', numericVariantId)
      .maybeSingle();

    if (existingItem) {
      await supabase.from('wishlist_items').delete().eq('id', existingItem.id);
      return { success: true, isInWishlist: false };
    } else {
      await supabase.from('wishlist_items').insert({
        wishlist_id: wishlist.id,
        variant_id: numericVariantId,
      });
      return { success: true, isInWishlist: true };
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Wishlist toggle failed';
    return { success: false, error: errorMessage, isInWishlist: false };
  }
}

export async function removeFromWishlist(variantIdOrItemId: string | number) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const targetId = Number(variantIdOrItemId);
    if (isNaN(targetId)) return { success: false, error: 'Invalid ID' };

    const supabase = getSupabaseAdmin();

    // 1. Resolve Customer ID
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (!customer) return { success: false, error: 'Customer not found' };

    // 2. Resolve Customer Wishlist
    const { data: wishlist } = await supabase
      .from('wishlists')
      .select('id')
      .eq('customer_id', customer.id)
      .maybeSingle();

    if (!wishlist) return { success: false, error: 'Wishlist not found' };

    console.log('[WISHLIST REMOVE] Target ID:', targetId, 'from wishlist:', wishlist.id);

    // 3. Delete matching row (by variant_id or primary key id)
    const { data, error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('wishlist_id', wishlist.id)
      .or(`variant_id.eq.${targetId},id.eq.${targetId}`)
      .select();

    if (error) {
      console.error('[WISHLIST REMOVE ERROR]:', error);
      return { success: false, error: error.message };
    }

    console.log('[WISHLIST REMOVE SUCCESS]: Removed row(s):', data);
    return { success: true, count: data?.length || 0 };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to remove from wishlist';
    console.error('[WISHLIST REMOVE UNCAUGHT EXCEPTION]:', err);
    return { success: false, error: errorMessage };
  }
}

export async function moveToCart(variantId: string | number, quantity: number = 1) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const numericVariantId = Number(variantId);
    if (isNaN(numericVariantId)) return { success: false, error: 'Invalid Variant ID' };

    const supabase = getSupabaseAdmin();

    // 1. Resolve Customer
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (!customer) return { success: false, error: 'Customer not found' };

    // 2. Get or Create Cart
    let { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('customer_id', customer.id)
      .maybeSingle();

    if (!cart) {
      const { data: newCart, error: createCartErr } = await supabase
        .from('carts')
        .insert({
          customer_id: customer.id,
          session_token: `customer_${customer.id}_${Date.now()}`
        })
        .select('id')
        .single();
      if (createCartErr) {
        console.error('[MOVE TO CART] Failed creating cart:', createCartErr);
        return { success: false, error: createCartErr.message };
      }
      cart = newCart;
    }

    console.log('[MOVE TO CART] Target cart ID:', cart.id, 'for variant:', numericVariantId);

    // 3. Upsert into cart_items (leveraging unique(cart_id, variant_id))
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cart.id)
      .eq('variant_id', numericVariantId)
      .maybeSingle();

    if (existingItem) {
      await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id);
    } else {
      const { error: insertErr } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cart.id,
          variant_id: numericVariantId,
          quantity: quantity,
        });
      if (insertErr) {
        console.error('[MOVE TO CART] Failed inserting into cart_items:', insertErr);
        return { success: false, error: insertErr.message };
      }
    }

    // 4. Delete item from wishlist_items
    const { data: wishlist } = await supabase
      .from('wishlists')
      .select('id')
      .eq('customer_id', customer.id)
      .maybeSingle();

    if (wishlist) {
      await supabase
        .from('wishlist_items')
        .delete()
        .eq('wishlist_id', wishlist.id)
        .or(`variant_id.eq.${numericVariantId},id.eq.${numericVariantId}`);
    }

    console.log('[MOVE TO CART SUCCESS]: Variant', numericVariantId, 'transferred to cart', cart.id);
    return { success: true, cartId: cart.id };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to move to cart';
    console.error('[MOVE TO CART UNCAUGHT EXCEPTION]:', err);
    return { success: false, error: errorMessage };
  }
}
