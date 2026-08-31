'use server';

import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

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
      revalidatePath('/wishlist');
      revalidatePath('/shop');
      return { success: true, isInWishlist: false };
    } else {
      await supabase.from('wishlist_items').insert({
        wishlist_id: wishlist.id,
        variant_id: numericVariantId,
      });
      revalidatePath('/wishlist');
      revalidatePath('/shop');
      return { success: true, isInWishlist: true };
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Wishlist toggle failed';
    return { success: false, error: errorMessage, isInWishlist: false };
  }
}

export async function removeFromWishlist(params: {
  wishlistItemId?: number | string | null;
  variantId?: number | string | null;
} | number | string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    let wishlistItemId: number | null = null;
    let variantId: number | null = null;

    if (typeof params === 'object' && params !== null) {
      if (params.wishlistItemId) wishlistItemId = Number(params.wishlistItemId);
      if (params.variantId) variantId = Number(params.variantId);
    } else if (params !== undefined && params !== null) {
      const num = Number(params);
      if (!isNaN(num)) {
        variantId = num;
      }
    }

    const supabase = getSupabaseAdmin();

    // 1. Resolve Customer Record
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

    let deleteQuery = supabase
      .from('wishlist_items')
      .delete()
      .eq('wishlist_id', wishlist.id);

    if (wishlistItemId && !isNaN(wishlistItemId)) {
      deleteQuery = deleteQuery.eq('id', wishlistItemId);
    } else if (variantId && !isNaN(variantId)) {
      deleteQuery = deleteQuery.eq('variant_id', variantId);
    } else {
      return { success: false, error: 'No valid wishlistItemId or variantId provided' };
    }

    const { data: deletedRows, error: deleteErr } = await deleteQuery.select();

    if (deleteErr) {
      console.error('[WISHLIST REMOVE ERROR]:', deleteErr);
      return { success: false, error: deleteErr.message };
    }

    revalidatePath('/wishlist');
    revalidatePath('/shop');

    console.log('[WISHLIST REMOVE SUCCESS]: Removed row(s):', deletedRows);
    return { success: true, count: deletedRows?.length || 0, deletedRows };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to remove from wishlist';
    console.error('[WISHLIST REMOVE UNCAUGHT EXCEPTION]:', err);
    return { success: false, error: errorMessage };
  }
}

export async function moveToCart(params: {
  variantId: string | number;
  wishlistItemId?: string | number | null;
  quantity?: number;
} | string | number) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    let variantIdVal: string | number;
    let wishlistItemIdVal: string | number | null = null;
    let quantityVal = 1;

    if (typeof params === 'object' && params !== null) {
      variantIdVal = params.variantId;
      wishlistItemIdVal = params.wishlistItemId || null;
      quantityVal = params.quantity || 1;
    } else {
      variantIdVal = params;
    }

    const numericVariantId = Number(variantIdVal);
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

    // 3. Upsert into cart_items
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cart.id)
      .eq('variant_id', numericVariantId)
      .maybeSingle();

    if (existingItem) {
      await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantityVal })
        .eq('id', existingItem.id);
    } else {
      const { error: insertErr } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cart.id,
          variant_id: numericVariantId,
          quantity: quantityVal,
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
      let removeQuery = supabase
        .from('wishlist_items')
        .delete()
        .eq('wishlist_id', wishlist.id);

      const numericWishlistItemId = wishlistItemIdVal ? Number(wishlistItemIdVal) : null;
      if (numericWishlistItemId && !isNaN(numericWishlistItemId)) {
        removeQuery = removeQuery.eq('id', numericWishlistItemId);
      } else {
        removeQuery = removeQuery.eq('variant_id', numericVariantId);
      }

      const { data: deletedRows } = await removeQuery.select();
      console.log('[MOVE TO CART DELETE WISHLIST]: Removed row(s):', deletedRows);
    }

    revalidatePath('/wishlist');
    revalidatePath('/shop');

    console.log('[MOVE TO CART SUCCESS]: Variant', numericVariantId, 'transferred to cart', cart.id);
    return { success: true, cartId: cart.id };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to move to cart';
    console.error('[MOVE TO CART UNCAUGHT EXCEPTION]:', err);
    return { success: false, error: errorMessage };
  }
}
