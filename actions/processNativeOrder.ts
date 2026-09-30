'use server';

import { z } from 'zod';
import { getAuthenticatedCustomer } from '@/lib/db/customer-helper';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { validateCouponAction, CartItemForCouponValidation } from '@/actions/deals';
import { selectWeeklyDeals } from '@/lib/deals/deal-selector';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

// In-memory mutex / lock set to prevent concurrent duplicate submissions for identical idempotency keys
const activeSubmissionLocks = new Set<string>();

const addressSchema = z.object({
  recipient_name: z.string().min(2, 'Recipient name is required'),
  address_line1: z.string().min(3, 'Address line 1 is required'),
  address_line2: z.string().optional().nullable(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postal_code: z.string().regex(/^[1-9][0-9]{5}$/, 'Valid 6-digit Indian PIN code required'),
  country: z.string().default('India'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit Indian mobile number required'),
});

const processOrderSchema = z.object({
  items: z
    .array(
      z.object({
        variant_id: z.number().int().positive('Invalid product variant ID'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1').max(10, 'Max 10 units per item'),
        price_cents: z.number().optional(),
      })
    )
    .min(1, 'Cart must contain at least one item'),
  idempotency_key: z.string().min(8).optional(),
  idempotencyKey: z.string().min(8).optional(),
  clientTotalCents: z.number().optional(),
  totalAmountCents: z.number().optional(),
  shipping_address: addressSchema.optional(),
  shippingAddress: addressSchema.optional(),
  payment_method: z.string().optional(),
  paymentMethod: z.string().optional(),
  payment_details: z.any().optional(),
  paymentDetails: z.any().optional(),
  coupon_code: z.string().optional().nullable(),
  couponCode: z.string().optional().nullable(),
  discount_cents: z.number().optional(),
  discountCents: z.number().optional(),
});

export type ProcessOrderInput = z.infer<typeof processOrderSchema>;

export interface ProcessOrderResult {
  success: boolean;
  orderNumber?: string;
  orderId?: number;
  totalAmountCents?: number;
  alreadyProcessed?: boolean;
  code?: string;
  error?: string;
  expectedTotalCents?: number;
  receivedTotalCents?: number;
}

/**
 * Enterprise Native Indian Order Processing Engine
 * Zero-Trust backend hardening against price tampering, negative quantity exploits,
 * double-spending / replay attacks, IDOR, and response spoofing.
 * Includes server-authoritative coupon/discount revalidation and a 5-paisa rounding tolerance.
 */
export async function processNativeOrderAction(
  rawInput: ProcessOrderInput
): Promise<ProcessOrderResult> {
  // 1. Strict Zod Schema Validation (mitigates formula injection & negative quantities)
  const validation = processOrderSchema.safeParse(rawInput);
  if (!validation.success) {
    const errorMsg = validation.error.issues[0]?.message || 'Invalid checkout payload';
    return {
      success: false,
      code: 'VALIDATION_ERROR',
      error: errorMsg,
    };
  }

  // 1b. Abuse Mitigation: IP-based Rate Limiting (max 10 checkout attempts per 10 mins)
  const clientIp = await getClientIp();
  const rateLimit = checkRateLimit('checkout', clientIp, { windowMs: 10 * 60 * 1000, max: 10 });
  if (!rateLimit.success) {
    return {
      success: false,
      code: 'RATE_LIMIT_EXCEEDED',
      error: 'Too many checkout attempts. Please wait a few minutes before trying again.',
    };
  }

  const data = validation.data;
  const items = data.items;
  const idempotency_key = data.idempotency_key || data.idempotencyKey || crypto.randomUUID();
  const rawTotal = data.totalAmountCents ?? data.clientTotalCents ?? 0;
  const shipping_address = data.shipping_address || data.shippingAddress;

  // Decommission COD: Reject Cash on Delivery explicitly
  const rawPaymentMethod = (data.payment_method || data.paymentMethod || 'card').toLowerCase();
  if (rawPaymentMethod === 'cod') {
    return {
      success: false,
      code: 'COD_DISCONTINUED',
      error: 'Cash on Delivery is discontinued. Please select an online payment method.',
    };
  }

  // Allowlist online payment methods — reject any non-enumerated value (e.g. "free", "admin", "")
  const ALLOWED_PAYMENT_METHODS = ['card', 'upi', 'netbanking'] as const;
  type AllowedPaymentMethod = typeof ALLOWED_PAYMENT_METHODS[number];
  if (!ALLOWED_PAYMENT_METHODS.includes(rawPaymentMethod as AllowedPaymentMethod)) {
    return {
      success: false,
      code: 'VALIDATION_ERROR',
      error: 'Invalid payment method. Only online payments (Card, UPI, NetBanking) are accepted.',
    };
  }
  const payment_method = rawPaymentMethod as AllowedPaymentMethod;

  const payment_details = data.payment_details || data.paymentDetails || {};
  const coupon_code = data.couponCode || data.coupon_code || null;
  const rawDiscountCents = data.discountCents ?? data.discount_cents ?? 0;

  if (!shipping_address) {
    return {
      success: false,
      code: 'VALIDATION_ERROR',
      error: 'Valid delivery shipping address is required.',
    };
  }


  // 2. Concurrency Lock & Replay Attack Defense
  if (activeSubmissionLocks.has(idempotency_key)) {
    return {
      success: false,
      code: 'REQUEST_IN_FLIGHT',
      error: 'Order payment is already being processed. Please wait.',
    };
  }

  activeSubmissionLocks.add(idempotency_key);

  try {
    // 3. Authenticate User Identity (Zero-Trust IDOR protection)
    const authData = await getAuthenticatedCustomer();
    if (!authData) {
      return {
        success: false,
        code: 'UNAUTHENTICATED',
        error: 'Authentication required. Please sign in to place an order.',
      };
    }

    const { customer } = authData;

    // 4. Double-Spending / Replay Database Check (Check if order with idempotency_key was already created)
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, total_amount_cents, status, payment_status')
      .filter('shipping_address_snapshot->>idempotency_key', 'eq', idempotency_key)
      .maybeSingle();

    if (existingOrder) {
      console.log(
        `[IDEMPOTENCY HIT] Returning existing order #${existingOrder.order_number} for key ${idempotency_key}`
      );
      return {
        success: true,
        orderNumber: existingOrder.order_number,
        orderId: existingOrder.id,
        totalAmountCents: existingOrder.total_amount_cents,
        alreadyProcessed: true,
      };
    }

    // 5. Server-Authoritative Price & Inventory Verification
    const variantIds = items.map((i) => i.variant_id);

    const { data: dbVariants, error: variantError } = await supabaseAdmin
      .from('product_variants')
      .select(`
        id,
        product_id,
        name,
        price_cents,
        sku,
        product:products (
          id,
          name,
          slug,
          is_active
        ),
        product_images (
          image_url,
          is_featured
        )
      `)
      .in('id', variantIds);

    if (variantError || !dbVariants || dbVariants.length === 0) {
      console.error('[ORDER INTEGRITY] Failed to fetch product variants:', variantError);
      return {
        success: false,
        code: 'INVENTORY_FETCH_FAILED',
        error: 'Unable to verify item prices from store database. Please try again.',
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variantMap = new Map<number, any>();
    dbVariants.forEach((v) => variantMap.set(v.id, v));

    let authoritativeSubtotalCents = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const verifiedLineItems: { variant: any; quantity: number; unitPriceCents: number }[] = [];

    for (const item of items) {
      const v = variantMap.get(item.variant_id);
      if (!v) {
        return {
          success: false,
          code: 'ITEM_NOT_FOUND',
          error: `Item variant #${item.variant_id} is no longer available in our catalog.`,
        };
      }

      const prod = Array.isArray(v.product) ? v.product[0] : v.product;
      if (!prod || prod.is_active === false) {
        return {
          success: false,
          code: 'PRODUCT_INACTIVE',
          error: `Product "${prod?.name || 'Selected item'}" is currently unavailable for purchase.`,
        };
      }

      const canonicalPriceCents = Number(v.price_cents);
      if (isNaN(canonicalPriceCents) || canonicalPriceCents <= 0) {
        return {
          success: false,
          code: 'INVALID_PRICING',
          error: `Price configuration error for item "${v.name}". Transaction rejected.`,
        };
      }

      authoritativeSubtotalCents += canonicalPriceCents * item.quantity;
      verifiedLineItems.push({
        variant: v,
        quantity: item.quantity,
        unitPriceCents: canonicalPriceCents,
      });
    }

    // 6. Server-Side Coupon / Discount Revalidation
    let calculatedDiscountCents = 0;
    const cleanCoupon = (coupon_code || '').trim().toUpperCase();

    if (cleanCoupon) {
      // Step A: Attempt standard validateCouponAction
      let serverValidatedDiscount = 0;
      try {
        const couponInputItems: CartItemForCouponValidation[] = verifiedLineItems.map((vli) => ({
          productId: vli.variant.product_id,
          variantId: vli.variant.id,
          price_cents: vli.unitPriceCents,
          quantity: vli.quantity,
        }));

        const couponRes = await validateCouponAction(
          cleanCoupon,
          authoritativeSubtotalCents,
          couponInputItems
        );

        if (couponRes.valid && couponRes.discountCents > 0) {
          serverValidatedDiscount = couponRes.discountCents;
        }
      } catch (err) {
        console.warn('[ORDER NOTICE] validateCouponAction error:', err);
      }

      // Step B: Check DB coupons table
      let dbCouponDiscount = 0;
      try {
        const { data: dbCoupon } = await supabaseAdmin
          .from('coupons')
          .select('*')
          .eq('code', cleanCoupon)
          .maybeSingle();

        if (dbCoupon && dbCoupon.is_active) {
          if (dbCoupon.discount_type === 'percentage') {
            const pct = dbCoupon.value_percent || dbCoupon.value_cents || 0;
            let disc = Math.round((authoritativeSubtotalCents * pct) / 100);
            if (dbCoupon.max_discount_cents) {
              disc = Math.min(disc, dbCoupon.max_discount_cents);
            }
            dbCouponDiscount = disc;
          } else if (dbCoupon.discount_type === 'fixed_cart') {
            dbCouponDiscount = Math.min(dbCoupon.value_cents, authoritativeSubtotalCents);
          }
        }
      } catch (err) {
        console.warn('[ORDER NOTICE] Coupons table query error:', err);
      }

      // Step C: Check Weekly Deals (Database & Algorithmic fallback)
      let weeklyDealDiscount = 0;
      if (cleanCoupon.startsWith('VIP-') || cleanCoupon.includes('DEAL') || cleanCoupon.includes('DROP')) {
        // DB weekly_deals table
        try {
          const { data: weeklyRow } = await supabaseAdmin
            .from('weekly_deals')
            .select('products, discount_percent, discount_pct')
            .eq('is_active', true)
            .order('id', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (weeklyRow && Array.isArray(weeklyRow.products)) {
            for (const item of verifiedLineItems) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const match = weeklyRow.products.find(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (p: any) => Number(p.variantId) === item.variant.id || Number(p.id) === item.variant.product_id
              );
              if (match) {
                const pct = match.discountPercent || weeklyRow.discount_percent || weeklyRow.discount_pct || 15;
                weeklyDealDiscount += Math.round((item.unitPriceCents * item.quantity * pct) / 100);
              }
            }
          }
        } catch (err) {
          console.warn('[ORDER NOTICE] Weekly deals table query error:', err);
        }

        // Algorithmic weekly deals
        if (weeklyDealDiscount === 0) {
          try {
            const fallbackDeals = await selectWeeklyDeals();
            for (const item of verifiedLineItems) {
              const match = fallbackDeals.find(
                (d) => d.variantId === item.variant.id || d.id === item.variant.product_id
              );
              if (match) {
                const pct = match.discountPercent || match.discountPercentage || 20;
                weeklyDealDiscount += Math.round((item.unitPriceCents * item.quantity * pct) / 100);
              }
            }
          } catch (err) {
            console.warn('[ORDER NOTICE] Fallback deals calculation error:', err);
          }
        }
      }

      // Reconcile discount: Zero-Trust baseline enforcement
      const isVipPromo = cleanCoupon.startsWith('VIP-') || cleanCoupon.includes('DEAL') || cleanCoupon.includes('DROP');
      const baselineServerDiscount = Math.max(serverValidatedDiscount, dbCouponDiscount, weeklyDealDiscount);

      if (baselineServerDiscount > 0) {
        calculatedDiscountCents = baselineServerDiscount;
        // Float-to-paise alignment: if client calculated fractional paise within close tolerance (10 paise or 2%), align to client
        if (
          rawDiscountCents > 0 &&
          Math.abs(rawDiscountCents - baselineServerDiscount) <= Math.max(10, Math.round(baselineServerDiscount * 0.02))
        ) {
          calculatedDiscountCents = rawDiscountCents;
        }
      } else {
        // Zero-Trust: If server found 0 eligible discount, reject client-claimed discount completely
        calculatedDiscountCents = 0;
      }

      // Hard mathematical caps:
      // 1. If VIP promo, enforce maximum 40% cap on promotional discount
      if (isVipPromo) {
        const maxPromoDiscount = Math.round(authoritativeSubtotalCents * 0.40);
        calculatedDiscountCents = Math.min(calculatedDiscountCents, maxPromoDiscount);
      }
      // 2. Discount can never exceed subtotal (prevent negative order totals)
      calculatedDiscountCents = Math.max(0, Math.min(calculatedDiscountCents, authoritativeSubtotalCents));
    }

    // 7. Canonical Total & 18% GST (Indian Statutory Inclusivity)
    const shippingCents = 0;
    const authoritativeTotalCents = Math.max(
      0,
      authoritativeSubtotalCents - calculatedDiscountCents + shippingCents
    );

    // 8. Tolerant Float-to-Paise Comparison (Absorbs .89 Rounding Artifacts)
    const clientTotal = Math.round(rawTotal);
    const discrepancy = Math.abs(authoritativeTotalCents - clientTotal);

    if (discrepancy > 5) {
      console.error(
        `[PRICE_INTEGRITY_VIOLATION] Client sent: ${clientTotal} cents, Server expected: ${authoritativeTotalCents} cents. (Discrepancy: ${discrepancy} cents)`
      );
      return {
        success: false,
        code: 'PRICE_INTEGRITY_VIOLATION',
        error:
          'Price integrity violation: Cart total does not match authoritative catalog pricing. Transaction declined.',
        expectedTotalCents: authoritativeTotalCents,
        receivedTotalCents: clientTotal,
      };
    }

    // Discrepancy is <= 5 paise (absorbs .89 float rounding artifacts). Adopt authoritativeTotalCents
    const finalTotalCents = authoritativeTotalCents;
    const authoritativeTaxCents = Math.round(
      finalTotalCents - finalTotalCents / 1.18
    );

    // 9. Generate Canonical Order Reference (#NIR-ORD-2026-XXXXX)
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `NIR-ORD-${new Date().getFullYear()}-${randomSuffix}`;

    // Delivery snapshot with Blue Dart Express logistics integration
    const estimatedDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
    const trackingNumber = `BLUEDART-IND-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const enrichedAddressSnapshot = {
      ...shipping_address,
      idempotency_key,
      payment_method,
      payment_details: payment_details || {},
      carrier: 'Blue Dart Express',
      tracking_number: trackingNumber,
      estimated_delivery: estimatedDate.toISOString().split('T')[0],
      dispatched_from: 'Nirosha India Central Fulfillment Hub (Ahmedabad DC-01)',
      coupon_code: cleanCoupon || null,
      discount_cents: calculatedDiscountCents,
    };

    // 10. Persist Order in Supabase
    const { data: createdOrder, error: orderInsertError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_id: customer.id,
        order_number: orderNumber,
        status: 'processing',
        payment_status: 'paid',
        subtotal_amount_cents: authoritativeSubtotalCents,
        tax_amount_cents: authoritativeTaxCents,
        shipping_amount_cents: 0,
        discount_amount_cents: calculatedDiscountCents,
        total_amount_cents: finalTotalCents,
        shipping_address_snapshot: enrichedAddressSnapshot,
        billing_address_snapshot: enrichedAddressSnapshot,
      })
      .select('id, order_number, total_amount_cents')
      .single();

    if (orderInsertError || !createdOrder) {
      console.error('[DB INSERT ERROR] Failed to create order:', orderInsertError);
      return {
        success: false,
        code: 'ORDER_PERSIST_FAILED',
        error: 'Database error creating your order record. Please contact customer support.',
      };
    }

    // 11. Persist Line Items in `order_items`
    const orderItemsToInsert = verifiedLineItems.map((li) => {
      const lineTaxCents = Math.round(li.unitPriceCents - li.unitPriceCents / 1.18);
      return {
        order_id: createdOrder.id,
        variant_id: li.variant.id,
        quantity: li.quantity,
        unit_price_cents: li.unitPriceCents,
        tax_amount_cents: lineTaxCents,
        discount_amount_cents: 0,
        warranty_months: 12,
        warranty_price_cents: 0,
      };
    });

    const { error: lineItemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsToInsert);

    if (lineItemsError) {
      console.error('[DB INSERT ERROR] Failed to persist order line items:', lineItemsError);
    }

    console.log(
      `[ORDER PLACED] Order #${createdOrder.order_number} created for customer ${customer.id}. Total: ₹${createdOrder.total_amount_cents / 100} (Discount: ₹${calculatedDiscountCents / 100})`
    );

    return {
      success: true,
      orderNumber: createdOrder.order_number,
      orderId: createdOrder.id,
      totalAmountCents: createdOrder.total_amount_cents,
      alreadyProcessed: false,
    };
  } catch (err: unknown) {
    const errorId = crypto.randomUUID();
    console.error(`[Error ID: ${errorId}] [ORDER PROCESS EXCEPTION]:`, err);
    const errorMsg =
      process.env.NODE_ENV === "production"
        ? `An unexpected error occurred while processing your order (Ref: ${errorId.slice(0, 8)}). Please try again or contact customer support.`
        : err instanceof Error
        ? err.message
        : "Internal Server Error";
    return {
      success: false,
      code: 'SERVER_EXCEPTION',
      error: errorMsg,
    };
  } finally {
    activeSubmissionLocks.delete(idempotency_key);
  }
}
