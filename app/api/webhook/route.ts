import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { backendClient } from "@/sanity/lib/backendClient";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    console.error("⚠️ Stripe Webhook Error: Missing stripe-signature header");
    return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("⚠️ Stripe Webhook Error: STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET missing" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown signature error";
    console.error(`❌ Webhook Signature Verification Failed: ${errorMsg}`);
    return NextResponse.json({ error: `Webhook Error: ${errorMsg}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      console.log(`📦 Processing checkout.session.completed for session: ${session.id}`);

      // Retrieve full line items with product metadata expansion
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ["data.price.product"],
      });

      // Parse delivery address safely
      let parsedAddress = null;
      if (session.metadata?.address) {
        try {
          parsedAddress = JSON.parse(session.metadata.address);
        } catch {
          parsedAddress = session.metadata.address;
        }
      }

      // Build Sanity Product references array
      const sanityProducts = lineItems.data.map((item) => {
        const stripeProduct = item.price?.product as Stripe.Product | undefined;
        const refId = stripeProduct?.metadata?.id || item.id;

        return {
          _key: crypto.randomUUID(),
          product: refId
            ? {
                _type: "reference",
                _ref: refId,
              }
            : undefined,
          quantity: item.quantity || 1,
        };
      });

      // Assemble Sanity Order document strictly matching orderType.ts schema
      const orderDoc = {
        _type: "order",
        orderNumber: session.metadata?.orderNumber || `ORD-${Date.now()}`,
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : "",
        clerkUserId: session.metadata?.clerkUserId || "guest_user",
        customerName: session.metadata?.customerName || session.customer_details?.name || "Customer",
        customerEmail: session.customer_details?.email || session.metadata?.customerEmail || "customer@example.com",
        currency: (session.currency || "inr").toUpperCase(),
        totalPrice: (session.amount_total || 0) / 100,
        status: "paid",
        products: sanityProducts,
        address: parsedAddress,
      };

      console.log("📝 Attempting to write order document to Sanity:", orderDoc.orderNumber);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const createdOrder = await backendClient.create(orderDoc as any);
      console.log("🎉 SUCCESS! Created Order Document ID:", createdOrder._id);

      // Inventory Stock Decrement (isolated per product)
      for (const item of lineItems.data) {
        const stripeProduct = item.price?.product as Stripe.Product | undefined;
        const productId = stripeProduct?.metadata?.id;
        const quantityPurchased = item.quantity || 1;

        if (productId) {
          try {
            const product = await backendClient.getDocument(productId);
            if (product && typeof product.stock === "number") {
              const newStock = Math.max(0, product.stock - quantityPurchased);
              await backendClient
                .patch(productId)
                .set({ stock: newStock })
                .commit();
              console.log(`📉 Decremented stock for ${productId}: ${product.stock} -> ${newStock}`);
            }
          } catch (stockErr) {
            console.error(`⚠️ Stock update skipped for product ${productId}:`, stockErr);
          }
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (sanityErr: any) {
      console.error("❌ Sanity Mutation Error:", sanityErr?.message || sanityErr);
      console.error("Detailed Error Details:", JSON.stringify(sanityErr?.details || sanityErr, null, 2));
    }
  }

  // Always return 200 OK to Stripe
  return NextResponse.json({ received: true }, { status: 200 });
}
