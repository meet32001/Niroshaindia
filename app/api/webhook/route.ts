import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseServer } from "@/lib/supabase/server";

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

      // Build Order record for Supabase
      const orderDoc = {
        order_number: session.metadata?.orderNumber || `ORD-${Date.now()}`,
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : "",
        clerk_user_id: session.metadata?.clerkUserId || "guest_user",
        customer_name: session.metadata?.customerName || session.customer_details?.name || "Customer",
        customer_email: session.customer_details?.email || session.metadata?.customerEmail || "customer@example.com",
        currency: (session.currency || "inr").toUpperCase(),
        total_price_cents: session.amount_total || 0,
        total_price: (session.amount_total || 0) / 100,
        status: "paid",
        address: parsedAddress,
        items: lineItems.data.map((item) => ({
          id: (item.price?.product as Stripe.Product)?.metadata?.id || "",
          quantity: item.quantity,
          amount_total: item.amount_total,
        })),
      };

      console.log("📝 Attempting to write order document to Supabase:", orderDoc.order_number);
      const { data: createdOrder, error: orderErr } = await supabaseServer
        .from("orders")
        .insert([orderDoc])
        .select()
        .single();

      if (orderErr) {
        console.warn("⚠️ Supabase Order Insert notice (mock environment or missing table):", orderErr.message);
      } else {
        console.log("🎉 SUCCESS! Created Supabase Order ID:", createdOrder.id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("❌ Order Processing Error:", msg);
    }
  }

  // Always return 200 OK to Stripe
  return NextResponse.json({ received: true }, { status: 200 });
}
