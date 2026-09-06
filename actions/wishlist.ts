'use server';

import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const variantIdSchema = z.union([
  z.number().int().positive(),
  z.string().regex(/^\d+$/).transform(Number),
]);

const removeFromWishlistSchema = z.union([
  z.object({
    wishlistItemId: z.union([z.number().int().positive(), z.string().regex(/^\d+$/).transform(Number)]).optional().nullable(),
    variantId: z.union([z.number().int().positive(), z.string().regex(/^\d+$/).transform(Number)]).optional().nullable(),
  }),
  z.number().int().positive(),
  z.string().regex(/^\d+$/).transform(Number),
]);

const moveToCartSchema = z.union([
  z.object({
    variantId: z.union([z.number().int().positive(), z.string().regex(/^\d+$/).transform(Number)]),
    wishlistItemId: z.union([z.number().int().positive(), z.string().regex(/^\d+$/).transform(Number)]).optional().nullable(),
    quantity: z.number().int().min(1).max(10).optional().default(1),
  }),
  z.number().int().positive(),
  z.string().regex(/^\d+$/).transform(Number),
]);

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

    const parseResult = variantIdSchema.safeParse(variantId);
    if (!parseResult.success) {
      return { success: false, error: 'Invalid Variant ID', isInWishlist: false };
    }
    const numericVariantId = parseResult.data;

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

    const parseResult = removeFromWishlistSchema.safeParse(params);
    if (!parseResult.success) {
      return { success: false, error: 'Invalid parameters provided for wishlist removal' };
    }

    let wishlistItemId: number | null = null;
    let variantId: number | null = null;

    const parsedData = parseResult.data;
    if (typeof parsedData === 'object' && parsedData !== null) {
      if (parsedData.wishlistItemId) wishlistItemId = parsedData.wishlistItemId;
      if (parsedData.variantId) variantId = parsedData.variantId;
    } else if (typeof parsedData === 'number') {
      variantId = parsedData;
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

    const parseResult = moveToCartSchema.safeParse(params);
    if (!parseResult.success) {
      return { success: false, error: 'Invalid parameters for moving item to cart' };
    }

    let variantIdVal: number;
    let wishlistItemIdVal: number | null = null;
    let quantityVal = 1;

    const parsedData = parseResult.data;
    if (typeof parsedData === 'object' && parsedData !== null) {
      variantIdVal = parsedData.variantId;
      wishlistItemIdVal = parsedData.wishlistItemId || null;
      quantityVal = parsedData.quantity || 1;
    } else {
      variantIdVal = parsedData;
    }

    const numericVariantId = variantIdVal;

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

      await removeQuery.select();
    }

    revalidatePath('/wishlist');
    revalidatePath('/shop');

    return { success: true, cartId: cart.id };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to move to cart';
    console.error('[MOVE TO CART UNCAUGHT EXCEPTION]:', err);
    return { success: false, error: errorMessage };
  }
}
