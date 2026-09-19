import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { selectWeeklyDeals } from "../lib/deals/deal-selector";
import { WeeklyDealsEmail, DealEmailItem } from "../emails/WeeklyDealsEmail";

// 1. Load Environment Variables
const envLocalPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  dotenv.config();
}

const isDryRun = process.argv.includes("--dry-run");

async function dispatchWeeklyDeals() {
  console.log("===============================================================");
  console.log("🚀 NIROSHA INDIA: AUTOMATED WEEKLY HIGH-TICKET DEALS BROADCAST");
  console.log("===============================================================");
  if (isDryRun) {
    console.log("⚠️  RUNNING IN DRY-RUN MODE: No external emails will be dispatched.");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ [ERROR] Missing Supabase credentials in environment!");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Calculate Week Number & Window
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  const year = now.getFullYear();
  const couponCode = `VIP-DROP-WK${weekNumber}`;

  // Starts now, expires coming Sunday at 23:59:59
  const startsAt = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  const expiresAt = new Date(now);
  expiresAt.setDate(now.getDate() + daysUntilSunday);
  expiresAt.setHours(23, 59, 59, 999);

  console.log(`📅 Campaign: Week ${weekNumber}, ${year}`);
  console.log(`🎟️  Coupon Code: ${couponCode}`);
  console.log(`⏰ Window: ${startsAt.toLocaleDateString("en-IN")} → ${expiresAt.toLocaleDateString("en-IN")}`);

  // Step A: Run High-Ticket Deal Selector Algorithm
  console.log("\n🔍 Selecting 6 high-ticket products across 6 distinct categories...");
  const deals = await selectWeeklyDeals();

  if (deals.length === 0) {
    console.error("❌ [ERROR] No high-ticket products could be selected.");
    process.exit(1);
  }

  console.log(`✅ Selected ${deals.length} premier products:`);
  deals.forEach((d, i) => {
    console.log(`   [${i + 1}] [${d.categoryName}] ${d.name}`);
    console.log(`       Price: ₹${Math.round(d.dealPriceCents / 100).toLocaleString("en-IN")} (Original: ₹${Math.round(d.originalPriceCents / 100).toLocaleString("en-IN")}, Save: ₹${Math.round(d.savingsCents / 100).toLocaleString("en-IN")})`);
  });

  // Step B: Record Deals in weekly_deals Table
  console.log("\n💾 Storing weekly deals in Supabase...");
  try {
    // Delete any existing deals for this week to avoid duplicates
    await supabase.from("weekly_deals").delete().match({ week_number: weekNumber, year });

    const rowsToInsert = deals.map((d) => ({
      week_number: weekNumber,
      year,
      product_id: d.id,
      deal_price_cents: d.dealPriceCents,
      coupon_code: couponCode,
      starts_at: startsAt.toISOString(),
      expires_at: expiresAt.toISOString(),
    }));

    const { error: insertDealsError } = await supabase.from("weekly_deals").insert(rowsToInsert);
    if (insertDealsError) {
      if (insertDealsError.message?.includes("does not exist") || insertDealsError.code === "42P01") {
        console.warn("⚠️  Table 'weekly_deals' does not exist yet. Run migration 20260920_newsletter_deals_system.sql.");
      } else {
        console.error("⚠️  Failed to insert into weekly_deals:", insertDealsError.message);
      }
    } else {
      console.log(`✅ Successfully recorded ${rowsToInsert.length} deals in 'weekly_deals'.`);
    }
  } catch (err: any) {
    console.warn("⚠️  weekly_deals table write skipped:", err.message);
  }

  // Step C: Seed or Update the Weekly Coupon in coupons Table
  console.log("\n🎟️  Seeding coupon into 'coupons' table...");
  try {
    const { error: couponError } = await supabase.from("coupons").upsert(
      {
        code: couponCode,
        discount_type: "fixed_cart",
        value_cents: 250000, // ₹2,500 extra voucher discount
        min_order_value_cents: 2000000, // ₹20,000 threshold
        starts_at: startsAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        is_active: true,
      },
      { onConflict: "code" }
    );

    if (couponError) {
      console.warn("⚠️  Coupon upsert notice:", couponError.message);
    } else {
      console.log(`✅ Coupon '${couponCode}' seeded (₹2,500 off on ₹20,000+).`);
    }
  } catch (err: any) {
    console.warn("⚠️  Coupon table notice:", err.message);
  }

  // Step D: Fetch Active Subscribers
  console.log("\n👥 Fetching active VIP subscribers...");
  let subscribers: { email: string }[] = [];
  try {
    const { data: subData, error: subError } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .eq("is_active", true);

    if (subError) {
      if (subError.message?.includes("does not exist") || subError.code === "42P01") {
        console.warn("⚠️  Table 'newsletter_subscribers' does not exist yet. Using test sandbox email.");
      } else {
        console.error("⚠️  Subscriber fetch error:", subError.message);
      }
    } else if (subData) {
      subscribers = subData;
    }
  } catch (err: any) {
    console.warn("⚠️  Subscribers query notice:", err.message);
  }

  console.log(`📊 Active subscribers found: ${subscribers.length}`);

  // Step E: Render HTML Email Template
  console.log("\n🎨 Compiling React Email template...");
  const formatINR = (cents: number) => "₹" + Math.round(cents / 100).toLocaleString("en-IN");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://niroshaindia.com";

  const emailDeals: DealEmailItem[] = deals.map((d) => ({
    id: d.id,
    name: d.name,
    categoryName: d.categoryName,
    imageUrl: d.imageUrl,
    mrpFormatted: formatINR(d.mrpCents),
    dealPriceFormatted: formatINR(d.dealPriceCents),
    savingsFormatted: formatINR(d.savingsCents),
    productUrl: `${baseUrl}/product/${d.slug}`,
  }));

  const emailHtml = await render(
    WeeklyDealsEmail({
      weekNumber,
      year,
      couponCode,
      deals: emailDeals,
      dealsUrl: `${baseUrl}/deals`,
    })
  );

  console.log(`✅ HTML template compiled (${emailHtml.length} bytes).`);

  if (isDryRun) {
    console.log("\n✨ Dry-run complete. All steps verified without sending external emails.");
    return;
  }

  // Step F: Dispatch Emails via Resend
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn("⚠️  RESEND_API_KEY not found. Skipping broadcast dispatch.");
    return;
  }

  const resend = new Resend(resendApiKey);
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Nirosha VIP <onboarding@resend.dev>";

  if (subscribers.length === 0) {
    console.log("ℹ️  No subscribers in database to dispatch to.");
    return;
  }

  console.log(`\n📨 Dispatching emails to ${subscribers.length} subscribers via Resend...`);
  let successCount = 0;
  let failCount = 0;

  for (const sub of subscribers) {
    try {
      const { error: sendError } = await resend.emails.send({
        from: fromEmail,
        to: sub.email,
        subject: `Exclusive Monday Drop: 6 High-Ticket Tech Deals for VIP Members (Week ${weekNumber})`,
        html: emailHtml,
      });

      if (sendError) {
        console.warn(`   ⚠️ Failed for ${sub.email}:`, sendError.message);
        failCount++;
      } else {
        console.log(`   ✅ Sent to: ${sub.email}`);
        successCount++;
      }
    } catch (err: any) {
      console.warn(`   ⚠️ Error sending to ${sub.email}:`, err.message);
      failCount++;
    }
  }

  console.log("\n===============================================================");
  console.log(`🏁 BROADCAST COMPLETE: ${successCount} sent, ${failCount} failed.`);
  console.log("===============================================================");
}

dispatchWeeklyDeals().catch((err) => {
  console.error("FATAL ERROR in dispatchWeeklyDeals:", err);
  process.exit(1);
});
