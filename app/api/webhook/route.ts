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
    return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder";
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Webhook signature verification failed";
    console.error(`Webhook Error: ${errorMsg}`);
    return NextResponse.json({ error: `Webhook Error: ${errorMsg}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const { orderNumber, customerName, customerEmail, clerkUserId, address } =
        session.metadata || {};

      let parsedAddress = null;
      if (address) {
        try {
          parsedAddress = JSON.parse(address);
        } catch {
          parsedAddress = address;
        }
      }

      // Retrieve full line items from Stripe
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ["data.price.product"],
      });

      // Prepare Sanity Product references array
      const sanityProducts = lineItems.data.map((item) => {
        const stripeProduct = item.price?.product as Stripe.Product | undefined;
        const productId = stripeProduct?.metadata?.id;

        return {
          _key: crypto.randomUUID(),
          product: productId
            ? {
                _type: "reference",
                _ref: productId,
              }
            : undefined,
          quantity: item.quantity || 1,
        };
      });

      // Create Order Document in Sanity
      const orderDoc = {
        _type: "order",
        orderNumber: orderNumber || `ORD-${Date.now()}`,
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : "",
        stripeCustomerId: typeof session.customer === "string" ? session.customer : "",
        clerkUserId: clerkUserId || "",
        customerName: customerName || session.customer_details?.name || "Customer",
        email: customerEmail || session.customer_details?.email || "",
        currency: session.currency || "inr",
        totalPrice: (session.amount_total || 0) / 100,
        status: "paid",
        orderDate: new Date().toISOString(),
        products: sanityProducts,
        address: parsedAddress,
      };

      await backendClient.create(orderDoc);

      // Decrement Inventory Stock in Sanity
      for (const item of lineItems.data) {
        const stripeProduct = item.price?.product as Stripe.Product | undefined;
        const productId = stripeProduct?.metadata?.id;
        const quantityPurchased = item.quantity || 1;

        if (productId) {
          try {
            // Fetch current product stock
            const product = await backendClient.getDocument(productId);
            if (product && typeof product.stock === "number") {
              const newStock = Math.max(0, product.stock - quantityPurchased);
              await backendClient
                .patch(productId)
                .set({ stock: newStock })
                .commit();
            }
          } catch (patchErr) {
            console.error(`Failed to update stock for product ${productId}:`, patchErr);
          }
        }
      }
    } catch (dbErr) {
      console.error("Error creating Sanity order or updating stock:", dbErr);
      return NextResponse.json({ error: "Failed to process order" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
