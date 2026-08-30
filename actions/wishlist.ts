'use server';

import { getAuthenticatedCustomer } from '@/lib/db/customer-helper';

export async function getWishlistItems() {
  try {
    const authData = await getAuthenticatedCustomer();
    if (!authData) {
      return { success: false, error: 'Unauthenticated', items: [] };
    }

    const { customer, supabaseAdmin } = authData;

    const { data: wishlist } = await supabaseAdmin
      .from('wishlists')
      .select(`
        id,
        wishlist_items (
          id,
          product_id,
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

export async function toggleWishlistItem(variantId?: string | null, productId?: string | null) {
  try {
    const authData = await getAuthenticatedCustomer();
    if (!authData) {
      return { success: false, error: 'Unauthenticated', isInWishlist: false };
    }

    const { customer, supabaseAdmin } = authData;

    // 1. Get or create customer wishlist
    let { data: wishlist } = await supabaseAdmin
      .from('wishlists')
      .select('id')
      .eq('customer_id', customer.id)
      .maybeSingle();

    if (!wishlist) {
      const { data: newWishlist } = await supabaseAdmin
        .from('wishlists')
        .insert({ customer_id: customer.id })
        .select('id')
        .single();
      wishlist = newWishlist;
    }

    if (!wishlist) {
      return { success: false, error: 'Failed to access wishlist', isInWishlist: false };
    }

    // 2. Check if item exists in wishlist_items
    let query = supabaseAdmin
      .from('wishlist_items')
      .select('id')
      .eq('wishlist_id', wishlist.id);

    if (variantId) {
      query = query.eq('variant_id', variantId);
    } else if (productId) {
      query = query.eq('product_id', productId);
    } else {
      return { success: false, error: 'Missing variantId or productId', isInWishlist: false };
    }

    const { data: existingItem } = await query.maybeSingle();

    if (existingItem) {
      // Remove from wishlist
      await supabaseAdmin.from('wishlist_items').delete().eq('id', existingItem.id);
      return { success: true, isInWishlist: false };
    } else {
      // Insert into wishlist
      await supabaseAdmin.from('wishlist_items').insert({
        wishlist_id: wishlist.id,
        variant_id: variantId || null,
        product_id: productId || null,
      });
      return { success: true, isInWishlist: true };
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Wishlist toggle failed';
    return { success: false, error: errorMessage, isInWishlist: false };
  }
}

export async function removeFromWishlist(itemId: string) {
  try {
    const authData = await getAuthenticatedCustomer();
    if (!authData) {
      return { success: false, error: 'Unauthenticated' };
    }

    const { customer, supabaseAdmin } = authData;

    // Resolve customer wishlist ID
    const { data: wishlist } = await supabaseAdmin
      .from('wishlists')
      .select('id')
      .eq('customer_id', customer.id)
      .maybeSingle();

    if (!wishlist) {
      return { success: false, error: 'Wishlist not found' };
    }

    const { error } = await supabaseAdmin
      .from('wishlist_items')
      .delete()
      .eq('id', itemId)
      .eq('wishlist_id', wishlist.id);

    if (error) {
      console.error('[REMOVE FROM WISHLIST ERROR]:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to remove from wishlist';
    return { success: false, error: errorMessage };
  }
}

export async function moveToCart(variantId?: string | null, productId?: string | null, quantity: number = 1) {
  try {
    const authData = await getAuthenticatedCustomer();
    if (!authData) {
      return { success: false, error: 'Unauthenticated' };
    }

    const { customer, supabaseAdmin } = authData;

    // 1. Get customer wishlist
    const { data: wishlist } = await supabaseAdmin
      .from('wishlists')
      .select('id')
      .eq('customer_id', customer.id)
      .maybeSingle();

    // 2. Get or create active customer cart
    let { data: cart } = await supabaseAdmin
      .from('carts')
      .select('id')
      .eq('customer_id', customer.id)
      .maybeSingle();

    if (!cart) {
      const { data: newCart } = await supabaseAdmin
        .from('carts')
        .insert({ customer_id: customer.id })
        .select('id')
        .single();
      cart = newCart;
    }

    if (!cart) {
      return { success: false, error: 'Failed to access cart' };
    }

    // 3. Upsert into cart_items
    if (variantId) {
      const { data: existingCartItem } = await supabaseAdmin
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cart.id)
        .eq('variant_id', variantId)
        .maybeSingle();

      if (existingCartItem) {
        await supabaseAdmin
          .from('cart_items')
          .update({ quantity: existingCartItem.quantity + quantity })
          .eq('id', existingCartItem.id);
      } else {
        await supabaseAdmin.from('cart_items').insert({
          cart_id: cart.id,
          variant_id: variantId,
          quantity,
        });
      }
    }

    // 4. Remove from wishlist_items
    if (wishlist) {
      let removeQuery = supabaseAdmin
        .from('wishlist_items')
        .delete()
        .eq('wishlist_id', wishlist.id);

      if (variantId) {
        removeQuery = removeQuery.eq('variant_id', variantId);
      } else if (productId) {
        removeQuery = removeQuery.eq('product_id', productId);
      }

      await removeQuery;
    }

    return { success: true, cartId: cart.id };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to move item to cart';
    return { success: false, error: errorMessage };
  }
}
