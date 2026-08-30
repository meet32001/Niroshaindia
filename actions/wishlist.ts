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

export async function removeFromWishlist(rawTargetId: unknown) {
  console.log('====================================================');
  console.log('[DEBUG WISHLIST DELETE] 1. Action Invoked');
  console.log('[DEBUG WISHLIST DELETE] Passed rawTargetId:', rawTargetId, 'Type:', typeof rawTargetId);

  const { userId } = await auth();
  console.log('[DEBUG WISHLIST DELETE] 2. Clerk Session userId:', userId);
  if (!userId) {
    console.error('[DEBUG WISHLIST DELETE] FAILED: User not authenticated');
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = getSupabaseAdmin();

  // 1. Resolve Customer Record
  const { data: customer, error: custErr } = await supabase
    .from('customers')
    .select('id, clerk_user_id, email')
    .eq('clerk_user_id', userId)
    .single();

  console.log('[DEBUG WISHLIST DELETE] 3. Customer query result:', customer, 'Error:', custErr);
  if (custErr || !customer) {
    console.error('[DEBUG WISHLIST DELETE] FAILED: No matching customer found in DB');
    return { success: false, error: 'Customer not found' };
  }

  // 2. Resolve Customer Wishlist
  const { data: wishlist, error: wishErr } = await supabase
    .from('wishlists')
    .select('id, customer_id')
    .eq('customer_id', customer.id)
    .maybeSingle();

  console.log('[DEBUG WISHLIST DELETE] 4. Wishlist query result:', wishlist, 'Error:', wishErr);
  if (wishErr || !wishlist) {
    console.error('[DEBUG WISHLIST DELETE] FAILED: Customer has no active wishlist');
    return { success: false, error: 'Wishlist not found' };
  }

  // 3. Inspect Existing Items in Wishlist
  const { data: currentItems, error: listErr } = await supabase
    .from('wishlist_items')
    .select('*')
    .eq('wishlist_id', wishlist.id);

  console.log('[DEBUG WISHLIST DELETE] 5. Current rows in wishlist_items for wishlist_id =', wishlist.id, ':', currentItems, 'Error:', listErr);

  const parsedId = Number(rawTargetId);
  console.log('[DEBUG WISHLIST DELETE] 6. Target ID parsed as Number:', parsedId);

  // 4. Execute Targeted Deletion with SELECT confirmation
  const { data: deletedRows, error: deleteErr } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('wishlist_id', wishlist.id)
    .or(`id.eq.${parsedId},variant_id.eq.${parsedId}`)
    .select();

  console.log('[DEBUG WISHLIST DELETE] 7. Delete Query Output -> Deleted Rows:', deletedRows, 'Error:', deleteErr);
  console.log('====================================================');

  if (deleteErr) {
    return { success: false, error: deleteErr.message };
  }

  if (!deletedRows || deletedRows.length === 0) {
    console.warn('[DEBUG WISHLIST DELETE] WARNING: Query executed but 0 rows matched. Check if target ID exists in currentItems array logged in step 5.');
  } else {
    revalidatePath('/wishlist');
    revalidatePath('/shop');
  }

  return { success: true, count: deletedRows?.length || 0, deletedRows };
}

export async function moveToCart(variantId: string | number, quantity: number = 1) {
  try {
    console.log('====================================================');
    console.log('[DEBUG MOVE TO CART] 1. Action Invoked for variantId:', variantId);
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
      const { data: deletedRows } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('wishlist_id', wishlist.id)
        .or(`variant_id.eq.${numericVariantId},id.eq.${numericVariantId}`)
        .select();

      console.log('[MOVE TO CART DELETE WISHLIST]: Removed row(s):', deletedRows);
    }

    revalidatePath('/wishlist');
    revalidatePath('/shop');

    console.log('[MOVE TO CART SUCCESS]: Variant', numericVariantId, 'transferred to cart', cart.id);
    console.log('====================================================');
    return { success: true, cartId: cart.id };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to move to cart';
    console.error('[MOVE TO CART UNCAUGHT EXCEPTION]:', err);
    return { success: false, error: errorMessage };
  }
}
