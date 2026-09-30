import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { persistCompletedOrder } from "@/lib/orders/persistence";

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
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      console.log(`📦 Processing checkout.session.completed for session: ${session.id}`);
      const result = await persistCompletedOrder(session);
      if (result.success) {
        console.log(`🎉 SUCCESS! Persisted order in Supabase: ${result.orderNumber} (ID: ${result.orderId})`);
      } else {
        console.error("⚠️ Failed to persist order in webhook:", result.error);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("❌ Order Processing Error:", msg);
    }
  }

  // Always return 200 OK to Stripe
  return NextResponse.json({ received: true }, { status: 200 });
}
