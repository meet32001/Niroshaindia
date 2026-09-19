'use server';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';

/**
 * 1-Click VIP Deal Claim Flow
 * 1. Checks user authentication with Clerk.
 * 2. If unauthenticated: redirects to sign-in with return path preserving deal coupon & variant.
 * 3. If authenticated: adds variant to customer's active cart in Supabase (if available)
 *    and redirects straight to /checkout with coupon auto-applied.
 */
export async function claimVipDeal(variantId: number, couponCode: string) {
  const { userId } = await auth();

  // 1. If not signed in, redirect to Clerk sign-in with deep return path
  if (!userId) {
    const returnUrl = `/checkout?apply_deal=${encodeURIComponent(couponCode)}&variant_id=${variantId}`;
    redirect(`/sign-in?redirect=${encodeURIComponent(returnUrl)}`);
  }

  // 2. Add product variant to active cart in Supabase
  try {
    const { data: customer } = await supabaseServer
      .from('customers')
      .select('id')
      .eq('clerk_user_id', userId)
      .maybeSingle();

    if (customer?.id) {
      let { data: activeCart } = await supabaseServer
        .from('carts')
        .select('id')
        .eq('customer_id', customer.id)
        .eq('status', 'ACTIVE')
        .maybeSingle();

      if (!activeCart) {
        const { data: newCart } = await supabaseServer
          .from('carts')
          .insert([{ customer_id: customer.id, status: 'ACTIVE' }])
          .select('id')
          .single();
        activeCart = newCart;
      }

      if (activeCart?.id) {
        const { data: existingItem } = await supabaseServer
          .from('cart_items')
          .select('id, quantity')
          .eq('cart_id', activeCart.id)
          .eq('variant_id', variantId)
          .maybeSingle();

        if (existingItem) {
          await supabaseServer
            .from('cart_items')
            .update({ quantity: existingItem.quantity + 1, updated_at: new Date().toISOString() })
            .eq('id', existingItem.id);
        } else {
          await supabaseServer
            .from('cart_items')
            .insert([{ cart_id: activeCart.id, variant_id: variantId, quantity: 1 }]);
        }
      }
    }
  } catch (err) {
    console.warn('[claimVipDeal] Background cart sync non-fatal warning:', err);
  }

  // 3. Route directly to checkout with auto-applied coupon & variant parameters
  redirect(`/checkout?coupon=${encodeURIComponent(couponCode)}&variant_id=${variantId}`);
}

/**
 * Fetch variant details to dynamically hydrate client store when entering checkout via deep-link
 */
export async function getVariantForCheckout(variantId: number) {
  try {
    const { data: variant, error } = await supabaseServer
      .from('product_variants')
      .select(`
        id,
        price_cents,
        compare_at_price_cents,
        product:products!inner(
          id,
          name,
          slug,
          brand:brands(id, name, slug),
          category:categories(id, name, slug)
        ),
        images:product_images(image_url, is_featured, sort_order)
      `)
      .eq('id', variantId)
      .maybeSingle();

    if (error || !variant) {
      return { success: false, error: 'Variant not found' };
    }

    const featuredImg =
      variant.images?.find((img: any) => img.is_featured)?.image_url ||
      variant.images?.[0]?.image_url ||
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';

    const price = (variant.price_cents || 0) / 100;
    const compareAt = (variant.compare_at_price_cents || 0) / 100;
    const discount = compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;

    const productData: any = Array.isArray(variant.product) ? variant.product[0] : variant.product;
    if (!productData) {
      return { success: false, error: 'Product not found for variant' };
    }

    const productPayload = {
      id: productData.id,
      _id: String(productData.id),
      name: productData.name,
      slug: productData.slug,
      price,
      discount,
      image: featuredImg,
      images: [featuredImg],
      variantId: variant.id,
    };

    return { success: true, product: productPayload };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error loading variant' };
  }
}

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  discountCents: number;
  discountPercent?: number;
  message: string;
}

/**
 * Validate coupon code against database or VIP deals rules
 */
export async function validateCouponAction(
  rawCode: string,
  subtotalCents: number
): Promise<CouponValidationResult> {
  const code = (rawCode || '').trim().toUpperCase();
  if (!code) {
    return { valid: false, code: '', discountCents: 0, message: 'Please enter a coupon code' };
  }

  try {
    const { data: coupon, error } = await supabaseServer
      .from('coupons')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (!error && coupon) {
      if (!coupon.is_active) {
        return { valid: false, code, discountCents: 0, message: 'This coupon is no longer active' };
      }

      const now = new Date();
      if (coupon.starts_at && new Date(coupon.starts_at) > now) {
        return { valid: false, code, discountCents: 0, message: 'This coupon is not active yet' };
      }
      if (coupon.expires_at && new Date(coupon.expires_at) < now) {
        return { valid: false, code, discountCents: 0, message: 'This coupon has expired' };
      }
      if (coupon.min_order_value_cents && subtotalCents < coupon.min_order_value_cents) {
        const minRupees = Math.round(coupon.min_order_value_cents / 100);
        return {
          valid: false,
          code,
          discountCents: 0,
          message: `Minimum order value of ₹${minRupees.toLocaleString('en-IN')} required for this coupon`,
        };
      }

      let discountCents = 0;
      let discountPercent: number | undefined;

      if (coupon.discount_type === 'PERCENT') {
        const pct = coupon.value_cents > 100 ? coupon.value_cents / 100 : coupon.value_cents;
        discountPercent = pct;
        discountCents = Math.round(subtotalCents * (pct / 100));
        if (coupon.max_discount_cents && discountCents > coupon.max_discount_cents) {
          discountCents = coupon.max_discount_cents;
        }
      } else {
        discountCents = Math.min(subtotalCents, coupon.value_cents);
      }

      return {
        valid: true,
        code,
        discountCents,
        discountPercent,
        message: `Coupon ${code} applied successfully!`,
      };
    }
  } catch (err) {
    console.warn('[validateCouponAction] Database check error:', err);
  }

  // Fallback matching for VIP Drop Coupons or Welcome Coupons
  if (code.startsWith('VIP-DROP-')) {
    // Default VIP discount 15% (or between 10%-25%)
    const discountPercent = 15;
    const discountCents = Math.round(subtotalCents * 0.15);
    return {
      valid: true,
      code,
      discountCents,
      discountPercent,
      message: `VIP Weekly Deal Coupon ${code} applied (15% OFF)!`,
    };
  }

  if (code === 'WELCOME-NIROSHA-500') {
    if (subtotalCents < 1000000) {
      return {
        valid: false,
        code,
        discountCents: 0,
        message: 'WELCOME-NIROSHA-500 requires a minimum order of ₹10,000',
      };
    }
    return {
      valid: true,
      code,
      discountCents: 50000,
      message: '₹500 VIP Welcome Discount applied!',
    };
  }

  return { valid: false, code, discountCents: 0, message: 'Invalid or expired coupon code' };
}

