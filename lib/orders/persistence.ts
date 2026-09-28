import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

export interface PersistOrderResult {
  success: boolean;
  orderNumber?: string;
  orderId?: number | string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order?: any;
  alreadyExisted?: boolean;
  error?: string;
}

/**
 * Persists a completed Stripe checkout session into Supabase `orders` and `order_items`.
 * Idempotent: checks by order_number before creating so webhook and success page can both call safely.
 */
export async function persistCompletedOrder(
  session: Stripe.Checkout.Session
): Promise<PersistOrderResult> {
  try {
    if (!session || (!session.id && !session.metadata)) {
      return { success: false, error: "Invalid Stripe session provided" };
    }

    const orderNumber =
      session.metadata?.orderNumber || `NIR-ORD-${session.id.slice(-8).toUpperCase()}`;

    // 1. Idempotency Check: Does order already exist in Supabase?
    const { data: existingOrder } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, status, total_amount_cents, customer_id, shipping_address_snapshot")
      .eq("order_number", orderNumber)
      .maybeSingle();

    if (existingOrder) {
      return {
        success: true,
        orderNumber: existingOrder.order_number,
        orderId: existingOrder.id,
        order: existingOrder,
        alreadyExisted: true,
      };
    }

    // 2. Resolve Customer ID
    const clerkUserId = session.metadata?.clerkUserId || null;
    const customerEmail =
      session.customer_details?.email || session.metadata?.customerEmail || null;
    let customerId: number | null = null;

    if (clerkUserId) {
      const { data: cByClerk } = await supabaseAdmin
        .from("customers")
        .select("id")
        .eq("clerk_user_id", clerkUserId)
        .maybeSingle();

      if (cByClerk?.id) {
        customerId = cByClerk.id;
      }
    }

    if (!customerId && customerEmail) {
      const { data: cByEmail } = await supabaseAdmin
        .from("customers")
        .select("id")
        .eq("email", customerEmail)
        .maybeSingle();

      if (cByEmail?.id) {
        customerId = cByEmail.id;
        if (clerkUserId) {
          await supabaseAdmin
            .from("customers")
            .update({ clerk_user_id: clerkUserId })
            .eq("id", customerId);
        }
      }
    }

    // Parse Address Snapshot
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsedAddress: any = null;
    if (session.metadata?.address) {
      try {
        parsedAddress =
          typeof session.metadata.address === "string"
            ? JSON.parse(session.metadata.address)
            : session.metadata.address;
      } catch {
        parsedAddress = null;
      }
    }

    if (!parsedAddress && session.customer_details?.address) {
      parsedAddress = {
        recipient_name: session.customer_details?.name || "Customer",
        address_line1: session.customer_details?.address?.line1 || "",
        address_line2: session.customer_details?.address?.line2 || "",
        city: session.customer_details?.address?.city || "",
        state: session.customer_details?.address?.state || "",
        postal_code: session.customer_details?.address?.postal_code || "",
        country: session.customer_details?.address?.country || "India",
        phone: session.customer_details?.phone || "",
      };
    }

    // If customer record still does not exist, create a new customer record
    if (!customerId && customerEmail) {
      const fullName =
        session.customer_details?.name || session.metadata?.customerName || "Customer";
      const nameParts = fullName.trim().split(" ");
      const firstName = nameParts[0] || "Customer";
      const lastName = nameParts.slice(1).join(" ") || "";
      const phone = session.customer_details?.phone || parsedAddress?.phone || null;

      const { data: newCust, error: custErr } = await supabaseAdmin
        .from("customers")
        .insert({
          clerk_user_id: clerkUserId,
          email: customerEmail,
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          is_active: true,
        })
        .select("id")
        .single();

      if (!custErr && newCust?.id) {
        customerId = newCust.id;
      }
    }

    // 3. Insert into `orders`
    const totalAmountCents = session.amount_total || 0;
    const subtotalCents = session.metadata?.verifiedSubtotalCents
      ? Number(session.metadata.verifiedSubtotalCents)
      : totalAmountCents;
    const discountCents = session.metadata?.discountCents
      ? Number(session.metadata.discountCents)
      : 0;

    const { data: createdOrder, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_id: customerId,
        order_number: orderNumber,
        status: "processing",
        payment_status: "paid",
        subtotal_amount_cents: subtotalCents,
        tax_amount_cents: 0,
        shipping_amount_cents: 0,
        discount_amount_cents: discountCents,
        total_amount_cents: totalAmountCents,
        shipping_address_snapshot: parsedAddress || {},
        billing_address_snapshot: parsedAddress || {},
      })
      .select()
      .single();

    if (orderErr || !createdOrder) {
      console.error("[PERSIST ORDER ERROR]: Failed to insert order:", orderErr);
      return { success: false, error: orderErr?.message || "Failed to insert order" };
    }

    // 4. Retrieve Line Items & Insert into `order_items`
    let lineItems = session.line_items?.data;
    if (!lineItems || lineItems.length === 0) {
      try {
        const expanded = await stripe.checkout.sessions.listLineItems(session.id, {
          expand: ["data.price.product"],
        });
        lineItems = expanded.data;
      } catch (liErr) {
        console.warn("[PERSIST ORDER NOTICE]: Could not expand line_items:", liErr);
      }
    }

    if (lineItems && lineItems.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orderItemsToInsert: any[] = [];

      for (const item of lineItems) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const prod = item.price?.product as any;
        const prodMeta = prod?.metadata || {};
        let variantId = prodMeta.variantId ? Number(prodMeta.variantId) : null;

        if (!variantId && prodMeta.productId) {
          const { data: foundVar } = await supabaseAdmin
            .from("product_variants")
            .select("id")
            .eq("product_id", Number(prodMeta.productId))
            .order("price_cents", { ascending: true })
            .limit(1)
            .maybeSingle();
          if (foundVar?.id) variantId = foundVar.id;
        }

        // Fallback default if unmapped
        if (!variantId || isNaN(variantId)) {
          variantId = 1;
        }

        const quantity = Math.max(1, item.quantity || 1);
        const unitPriceCents =
          item.price?.unit_amount != null
            ? item.price.unit_amount
            : Math.round((item.amount_total || 0) / quantity);

        orderItemsToInsert.push({
          order_id: createdOrder.id,
          variant_id: variantId,
          quantity: quantity,
          unit_price_cents: unitPriceCents,
          tax_amount_cents: 0,
          discount_amount_cents: 0,
          warranty_months: 12,
          warranty_price_cents: 0,
        });
      }

      if (orderItemsToInsert.length > 0) {
        const { error: itemsErr } = await supabaseAdmin
          .from("order_items")
          .insert(orderItemsToInsert);

        if (itemsErr) {
          console.error("[PERSIST ORDER ITEMS ERROR]: Failed to insert order_items:", itemsErr);
        }
      }
    }

    return {
      success: true,
      orderNumber: createdOrder.order_number,
      orderId: createdOrder.id,
      order: createdOrder,
      alreadyExisted: false,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[PERSIST ORDER EXCEPTION]:", msg);
    return { success: false, error: msg };
  }
}
