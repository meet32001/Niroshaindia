import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("⚠️ Clerk Webhook Error: CLERK_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "CLERK_WEBHOOK_SECRET is missing" },
      { status: 500 }
    );
  }

  // Retrieve Svix headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("⚠️ Clerk Webhook Error: Missing Svix headers");
    return NextResponse.json(
      { error: "Error occurred -- no svix headers" },
      { status: 400 }
    );
  }

  // Get raw payload body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown verification error";
    console.error("❌ Clerk Webhook Error: Signature verification failed:", errorMsg);
    return NextResponse.json(
      { error: `Webhook verification failed: ${errorMsg}` },
      { status: 400 }
    );
  }

  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const data = evt.data;
    const clerk_user_id = data.id;
    const email = data.email_addresses?.[0]?.email_address || "";
    const first_name = data.first_name || "";
    const last_name = data.last_name || "";
    const phone = data.phone_numbers?.[0]?.phone_number || null;

    console.log(`👤 Processing Clerk webhook event ${eventType} for user ${clerk_user_id}`);

    const { error } = await supabaseServer.from("customers").upsert(
      {
        clerk_user_id,
        email,
        first_name,
        last_name,
        phone,
        is_active: true,
      },
      { onConflict: "clerk_user_id" }
    );

    if (error) {
      console.error(`❌ Error upserting customer into Supabase: ${error.message}`);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ Successfully synced customer ${clerk_user_id} to Supabase`);
  } else if (eventType === "user.deleted") {
    const data = evt.data;
    const clerk_user_id = data.id;

    if (clerk_user_id) {
      console.log(`🗑️ Processing user.deleted for user ${clerk_user_id}`);
      const { error } = await supabaseServer
        .from("customers")
        .update({ is_active: false })
        .eq("clerk_user_id", clerk_user_id);

      if (error) {
        console.error(`❌ Error deactivating customer in Supabase: ${error.message}`);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log(`✅ Deactivated customer ${clerk_user_id} in Supabase`);
    }
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
