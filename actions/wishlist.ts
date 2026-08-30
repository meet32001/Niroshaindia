'use server';

import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
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

    if (!variantId) {
      return { success: false, error: 'Missing variantId', isInWishlist: false };
    }

    const { data: existingItem } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('wishlist_id', wishlist.id)
      .eq('variant_id', variantId)
      .maybeSingle();

    if (existingItem) {
      await supabase.from('wishlist_items').delete().eq('id', existingItem.id);
      return { success: true, isInWishlist: false };
    } else {
      await supabase.from('wishlist_items').insert({
        wishlist_id: wishlist.id,
        variant_id: variantId,
      });
      return { success: true, isInWishlist: true };
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Wishlist toggle failed';
    return { success: false, error: errorMessage, isInWishlist: false };
  }
}

export async function removeFromWishlist(variantId: string | number) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const supabase = getSupabaseAdmin();

    // 1. Get customer
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (!customer) return { success: false, error: 'Customer not found' };

    // 2. Get customer's wishlist
    const { data: wishlist } = await supabase
      .from('wishlists')
      .select('id')
      .eq('customer_id', customer.id)
      .single();

    if (!wishlist) return { success: false, error: 'Wishlist not found' };

    console.log('[WISHLIST DELETE] Removing variant/item:', variantId, 'from wishlist:', wishlist.id);

    const targetId = String(variantId);

    // 3. Delete row (match on wishlist_id and either primary key id or variant_id)
    const { data, error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('wishlist_id', wishlist.id)
      .or(`id.eq.${targetId},variant_id.eq.${targetId}`)
      .select();

    if (error) {
      console.error('[WISHLIST DELETE ERROR]:', error);
      return { success: false, error: error.message };
    }

    console.log('[WISHLIST DELETE SUCCESS]: Removed row count:', data?.length || 0);
    return { success: true, removed: data };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to remove from wishlist';
    console.error('[WISHLIST DELETE UNCAUGHT EXCEPTION]:', err);
    return { success: false, error: errorMessage };
  }
}

export async function moveToCart(variantId: string | number, quantity: number = 1) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const supabase = getSupabaseAdmin();

    // 1. Get customer
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (!customer) return { success: false, error: 'Customer not found' };

    // 2. Get or create active cart
    let { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('customer_id', customer.id)
      .maybeSingle();

    if (!cart) {
      const { data: newCart, error: cartCreateError } = await supabase
        .from('carts')
        .insert({ customer_id: customer.id, session_token: `customer_${customer.id}` })
        .select('id')
        .single();

      if (cartCreateError) {
        console.error('[MOVE TO CART] Failed creating cart:', cartCreateError);
        return { success: false, error: cartCreateError.message };
      }
      cart = newCart;
    }

    console.log('[MOVE TO CART] Target cart ID:', cart.id, 'for variant:', variantId);

    // 3. Insert or update cart_items
    const targetVariantId = String(variantId);
    const { data: existingCartItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cart.id)
      .eq('variant_id', targetVariantId)
      .maybeSingle();

    if (existingCartItem) {
      await supabase
        .from('cart_items')
        .update({ quantity: existingCartItem.quantity + quantity })
        .eq('id', existingCartItem.id);
    } else {
      const { error: insertCartError } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cart.id,
          variant_id: targetVariantId,
          quantity: quantity,
        });

      if (insertCartError) {
        console.error('[MOVE TO CART] Failed inserting into cart_items:', insertCartError);
        return { success: false, error: insertCartError.message };
      }
    }

    // 4. Delete from wishlist_items
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
        .or(`variant_id.eq.${targetVariantId},id.eq.${targetVariantId}`);
    }

    console.log('[MOVE TO CART SUCCESS] Moved variant:', variantId, 'to cart:', cart.id);
    return { success: true, cartId: cart.id };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to move to cart';
    console.error('[MOVE TO CART UNCAUGHT EXCEPTION]:', err);
    return { success: false, error: errorMessage };
  }
}
