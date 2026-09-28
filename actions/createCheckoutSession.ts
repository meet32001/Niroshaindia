"use server";

import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { CartItem } from "@/store";
import { urlFor } from "@/lib/image";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { validateCouponAction, CartItemForCouponValidation } from "@/actions/deals";
import { MOCK_PRODUCTS } from "@/lib/db/products";
import { persistCompletedOrder } from "@/lib/orders/persistence";

export interface CheckoutMetadata {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  clerkUserId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  address: any;
  couponCode?: string;
  discountCents?: number;
}

interface VerifiedItem {
  id: string;
  variantId: number;
  productId: number;
  name: string;
  description: string;
  imageUrl: string;
  priceCents: number;
  quantity: number;
  isDeal: boolean;
}

export async function createCheckoutSession(
  items: CartItem[],
  metadata: CheckoutMetadata
) {
  try {
    if (!items || items.length === 0) {
      throw new Error("Your cart is empty.");
    }

    // 1. Dynamically derive request origin from incoming request headers
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3001";
    const protocol =
      headersList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");

    const origin =
      process.env.NEXT_PUBLIC_BASE_URL && !process.env.NEXT_PUBLIC_BASE_URL.includes("localhost")
        ? process.env.NEXT_PUBLIC_BASE_URL
        : `${protocol}://${host}`;

    // 2. Search for existing customer by email in Stripe
    let customerId: string | undefined;
    if (metadata.customerEmail) {
      const customers = await stripe.customers.list({
        email: metadata.customerEmail,
        limit: 1,
      });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    // 3. Collect Candidate Identifiers for Server-Authoritative Database Price Verification
    const candidateVariantIds: number[] = [];
    const candidateProductIds: number[] = [];

    items.forEach((item) => {
      const p = item.product || {};
      const vIdRaw = p.variant_id ?? p.variantId ?? p.selectedVariant?.id;
      const pIdRaw = p.product_id ?? p.productId ?? p.id ?? p._id;

      if (vIdRaw != null && !isNaN(Number(vIdRaw))) {
        candidateVariantIds.push(Number(vIdRaw));
      }
      if (pIdRaw != null && !isNaN(Number(pIdRaw))) {
        candidateProductIds.push(Number(pIdRaw));
      }
    });

    // 4. Query Database for Real Product Variants and Stock
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let dbVariants: any[] = [];
    if (candidateVariantIds.length > 0 || candidateProductIds.length > 0) {
      const selectFields = `
        id,
        product_id,
        name,
        price_cents,
        compare_at_price_cents,
        product:products (
          id,
          name,
          description,
          is_active,
          slug,
          min_price_cents,
          max_price_cents
        ),
        images:product_images (
          image_url,
          is_featured,
          sort_order
        ),
        inventory:warehouse_inventory (
          quantity_on_hand,
          quantity_reserved
        )
      `;

      const queries = [];
      if (candidateVariantIds.length > 0) {
        queries.push(
          supabaseAdmin
            .from("product_variants")
            .select(selectFields)
            .in("id", candidateVariantIds)
        );
      }
      if (candidateProductIds.length > 0) {
        queries.push(
          supabaseAdmin
            .from("product_variants")
            .select(selectFields)
            .in("product_id", candidateProductIds)
        );
      }

      const results = await Promise.all(queries);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const combined: any[] = [];
      for (const res of results) {
        if (res.error) {
          console.error("[CHECKOUT SECURITY ERROR] Failed to query product_variants:", res.error);
          throw new Error("Unable to verify item pricing. Please try again.");
        }
        if (Array.isArray(res.data)) {
          combined.push(...res.data);
        }
      }
      // Deduplicate by variant id
      const seen = new Set<number>();
      dbVariants = combined.filter((v) => {
        if (seen.has(v.id)) return false;
        seen.add(v.id);
        return true;
      });
    }

    // 5. Match and Verify Every Cart Item Strictly Against Database Records
    const verifiedItems: VerifiedItem[] = [];
    let verifiedSubtotalCents = 0;

    for (const item of items) {
      const p = item.product || {};
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const vIdRaw = p.variant_id ?? p.variantId ?? p.selectedVariant?.id;
      const pIdRaw = p.product_id ?? p.productId ?? p.id ?? p._id;

      const targetVariantId = vIdRaw != null && !isNaN(Number(vIdRaw)) ? Number(vIdRaw) : null;
      const targetProductId = pIdRaw != null && !isNaN(Number(pIdRaw)) ? Number(pIdRaw) : null;

      const clientPriceCents =
        p.price_cents != null && Number(p.price_cents) > 0
          ? Number(p.price_cents)
          : Math.round((Number(p.price) || 0) * 100);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let matchedVariant: any = null;

      if (targetVariantId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        matchedVariant = dbVariants.find((v: any) => v.id === targetVariantId);
      }

      if (!matchedVariant && targetProductId) {
        // Find all variants for this product
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const productVariants = dbVariants.filter((v: any) => v.product_id === targetProductId);
        if (productVariants.length > 0) {
          // If multiple variants exist, prioritize exact price match with client intent to eliminate discrepancy
          if (clientPriceCents > 0) {
            productVariants.sort(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (a: any, b: any) =>
                Math.abs(Number(a.price_cents) - clientPriceCents) -
                Math.abs(Number(b.price_cents) - clientPriceCents)
            );
          } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            productVariants.sort((a: any, b: any) => Number(a.price_cents) - Number(b.price_cents));
          }
          matchedVariant = productVariants[0];
        }
      }

      // Fallback for mock development fixtures if testing non-database catalog items
      if (!matchedVariant && process.env.NODE_ENV !== "production") {
        const rawKey = String(p.slug || p.id || p._id || "");
        const mockMatch = MOCK_PRODUCTS.find(
          (m) => m.id === rawKey || m.slug === rawKey || String(m.id) === String(pIdRaw)
        );

        if (mockMatch) {
          const verifiedPriceCents = Math.round((mockMatch.price || 0) * 100);
          if (verifiedPriceCents <= 0) {
            throw new Error("One or more items in your cart are no longer valid.");
          }
          verifiedSubtotalCents += verifiedPriceCents * quantity;
          verifiedItems.push({
            id: mockMatch.id,
            variantId: 9999,
            productId: 9999,
            name: mockMatch.name || "Electronics Product",
            description: mockMatch.description || "High-performance electronics product.",
            imageUrl: Array.isArray(mockMatch.images)
              ? mockMatch.images[0]
              : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
            priceCents: verifiedPriceCents,
            quantity,
            isDeal: Boolean(p.isDeal),
          });
          continue;
        }
      }

      // If an item ID cannot be resolved in database, fail securely
      if (!matchedVariant) {
        console.warn("[CHECKOUT REJECTED] Unrecognized or missing product item:", {
          vIdRaw,
          pIdRaw,
        });
        throw new Error("One or more items in your cart are no longer valid.");
      }

      // Verify product is actively listed
      const productObj = Array.isArray(matchedVariant.product)
        ? matchedVariant.product[0]
        : matchedVariant.product;

      if (!productObj || productObj.is_active === false) {
        console.warn("[CHECKOUT REJECTED] Product is inactive:", productObj);
        throw new Error("One or more items in your cart are no longer valid.");
      }

      // Verify stock availability
      const invList = Array.isArray(matchedVariant.inventory)
        ? matchedVariant.inventory
        : matchedVariant.inventory
        ? [matchedVariant.inventory]
        : [];

      const availableStock =
        invList.length > 0
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            invList.reduce(
              (acc: number, inv: any) =>
                acc + Math.max(0, (inv.quantity_on_hand || 0) - (inv.quantity_reserved || 0)),
              0
            )
          : 50;

      if (availableStock < quantity) {
        console.warn("[CHECKOUT REJECTED] Insufficient inventory for variant:", matchedVariant.id);
        throw new Error("One or more items in your cart are no longer valid.");
      }

      const verifiedPriceCents = Number(matchedVariant.price_cents);
      if (!verifiedPriceCents || verifiedPriceCents <= 0) {
        console.warn("[CHECKOUT REJECTED] Invalid database price for variant:", matchedVariant.id);
        throw new Error("One or more items in your cart are no longer valid.");
      }

      // Parity audit log: log any price differences between catalog view and database variant
      if (clientPriceCents > 0 && verifiedPriceCents !== clientPriceCents) {
        console.warn(
          `[CHECKOUT PRICE DISCREPANCY AUDIT] Product ${matchedVariant.product_id} (Variant ${matchedVariant.id}): ` +
            `Cart requested ₹${clientPriceCents / 100}, DB verified ₹${verifiedPriceCents / 100}. Enforcing verified DB price.`
        );
      }

      // Extract image URL
      let imageUrl =
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
      if (Array.isArray(matchedVariant.images) && matchedVariant.images.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const featured = matchedVariant.images.find((img: any) => img.is_featured);
        imageUrl = (featured || matchedVariant.images[0])?.image_url || imageUrl;
      } else if (p.images && p.images[0]) {
        try {
          imageUrl = typeof p.images[0] === "string" ? p.images[0] : urlFor(p.images[0]).url();
        } catch {
          // fallback maintained
        }
      }

      verifiedSubtotalCents += verifiedPriceCents * quantity;

      verifiedItems.push({
        id: String(matchedVariant.id),
        variantId: matchedVariant.id,
        productId: matchedVariant.product_id,
        name: matchedVariant.name || productObj.name || "Electronics Product",
        description: productObj.description || "High-performance electronics product.",
        imageUrl,
        priceCents: verifiedPriceCents,
        quantity,
        isDeal: Boolean(p.isDeal),
      });
    }

    // 6. Server-Side Promotional and VIP Coupon Validation
    let serverDiscountCents = 0;
    if (metadata.couponCode && metadata.couponCode.trim().length > 0) {
      const couponInputItems: CartItemForCouponValidation[] = verifiedItems.map((vi) => ({
        productId: vi.productId,
        variantId: vi.variantId,
        price_cents: vi.priceCents,
        quantity: vi.quantity,
        isDeal: vi.isDeal,
      }));

      const couponResult = await validateCouponAction(
        metadata.couponCode.trim(),
        verifiedSubtotalCents,
        couponInputItems
      );

      if (couponResult.valid && couponResult.discountCents > 0) {
        serverDiscountCents = Math.min(couponResult.discountCents, verifiedSubtotalCents);
      } else {
        console.warn("[CHECKOUT COUPON REJECTED]:", couponResult.message);
      }
    }

    // 7. Build Stripe Line Items Using Strictly Verified Server Prices
    const line_items = verifiedItems.map((item) => {
      return {
        price_data: {
          currency: "inr",
          unit_amount: item.priceCents,
          product_data: {
            name: item.name,
            description: String(item.description).slice(0, 200),
            images: [item.imageUrl],
            metadata: {
              id: item.id,
              variantId: String(item.variantId),
              productId: String(item.productId),
            },
          },
        },
        quantity: item.quantity,
      };
    });

    // Apply server-validated discount proportionally across line items
    if (serverDiscountCents > 0 && verifiedSubtotalCents > 0) {
      const discountRatio = Math.min(1, serverDiscountCents / verifiedSubtotalCents);
      line_items.forEach((item) => {
        const originalUnit = item.price_data.unit_amount;
        const discountedUnit = Math.max(100, Math.round(originalUnit * (1 - discountRatio)));
        item.price_data.unit_amount = discountedUnit;
      });
    }

    // 8. Create Stripe Checkout Session with dynamic origin
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : metadata.customerEmail,
      payment_method_types: ["card"],
      mode: "payment",
      invoice_creation: {
        enabled: true,
      },
      metadata: {
        orderNumber: metadata.orderNumber,
        customerName: metadata.customerName,
        customerEmail: metadata.customerEmail,
        clerkUserId: metadata.clerkUserId || "",
        address: JSON.stringify(metadata.address),
        couponCode: metadata.couponCode || "",
        discountCents: String(serverDiscountCents),
        verifiedSubtotalCents: String(verifiedSubtotalCents),
      },
      line_items,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&order_number=${metadata.orderNumber}`,
      cancel_url: `${origin}/cart`,
    });

    return session.url;
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error);
    throw error;
  }
}

/**
 * Retrieve verified session details from Stripe for the /success confirmation page
 */
export async function getOrderSuccessDetails(sessionId: string) {
  try {
    if (!sessionId) return null;
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "line_items.data.price.product"],
    });
    if (!session) return null;

    // Failsafe for Webhooks: Guarantee order and order_items exist in Supabase
    const persistResult = await persistCompletedOrder(session);
    const orderNumber =
      persistResult.order?.order_number ||
      session.metadata?.orderNumber ||
      `NIR-ORD-${new Date().getFullYear()}-${session.id.slice(-8).toUpperCase()}`;

    let parsedAddress = null;
    if (session.metadata?.address) {
      try {
        parsedAddress = JSON.parse(session.metadata.address);
      } catch {
        parsedAddress = null;
      }
    }

    return {
      orderNumber,
      totalAmountPaid: (session.amount_total || 0) / 100,
      currency: session.currency?.toUpperCase() || "INR",
      customerEmail: session.customer_details?.email || session.metadata?.customerEmail || "",
      customerName: session.customer_details?.name || session.metadata?.customerName || "",
      paymentStatus: session.payment_status,
      address: parsedAddress || {
        recipient_name: session.customer_details?.name || "Valued Customer",
        address_line1: session.customer_details?.address?.line1 || "",
        address_line2: session.customer_details?.address?.line2 || "",
        city: session.customer_details?.address?.city || "",
        state: session.customer_details?.address?.state || "",
        postal_code: session.customer_details?.address?.postal_code || "",
      },
    };
  } catch (err) {
    console.error("Error retrieving stripe session for success page:", err);
    return null;
  }
}
