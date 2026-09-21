import { Container } from "@/components/layout/Container";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Flame, Sparkles, Zap, Tag } from "lucide-react";
import { DealsCountdown } from "@/components/deals/DealsCountdown";
import { DealsCouponBar } from "@/components/deals/DealsCouponBar";
import { ClaimDealButton } from "@/components/deals/ClaimDealButton";
import { selectWeeklyDeals, SelectedDealProduct } from "@/lib/deals/deal-selector";
import { createClient } from "@supabase/supabase-js";

export const metadata = {
  title: "VIP Weekly Deals & Bumper Offers | Nirosha India",
  description: "Exclusive hand-curated high-ticket electronics drops for Nirosha VIP Club members with up to 25% festival savings.",
};

export const dynamic = "force-dynamic";

async function getActiveWeeklyDeals(): Promise<{ deals: SelectedDealProduct[]; dealId?: number; couponCode: string; weekNumber: number }> {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  const currentCouponCode = `VIP-DROP-WK${weekNumber}`;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey && !supabaseUrl.includes("placeholder")) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      // Try fetching active drop from weekly_deals table
      const { data: dbDeals, error } = await supabase
        .from("weekly_deals")
        .select("*")
        .eq("is_active", true)
        .order("id", { ascending: false })
        .limit(1);

      if (!error && dbDeals && dbDeals.length > 0) {
        const row = dbDeals[0];
        if (Array.isArray(row.products) && row.products.length > 0) {
          return {
            deals: row.products,
            dealId: row.id,
            couponCode: row.coupon_code || currentCouponCode,
            weekNumber,
          };
        }
      }
    } catch (err) {
      console.warn("[DealsPage] Error querying weekly_deals table, falling back to algorithm:", err);
    }
  }

  // Fallback: Run selection algorithm directly
  const dynamicDeals = await selectWeeklyDeals();
  return {
    deals: dynamicDeals,
    couponCode: currentCouponCode,
    weekNumber,
  };
}

export default async function DealsPage() {
  const { deals, dealId, couponCode, weekNumber } = await getActiveWeeklyDeals();

  const formatINR = (cents: number) => {
    return "₹" + Math.round(cents / 100).toLocaleString("en-IN");
  };

  // In the 6+1 architecture, bumper weeks have 7 total deals (1 hero bumper + 6 standard category deals).
  // If deals array has 6 or fewer items, all 6 belong to the category grid.
  const hasDedicatedBumper = deals.length >= 7 && deals.some((d) => d.isBumperDeal);
  const bumperDeal = hasDedicatedBumper ? deals.find((d) => d.isBumperDeal) : null;
  const regularDeals = bumperDeal ? deals.filter((d) => d.id !== bumperDeal.id) : deals;

  return (
    <div className="py-8 sm:py-12 min-h-screen">
      <Container className="space-y-10">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-emerald-700 transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">VIP Weekly Drops</span>
        </nav>

        {/* Hero Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-[#FBF6EE] dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-xs">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/60">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>NIROSHA VIP MONDAY DROP • WEEK {weekNumber}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                Hand-Curated High-Ticket Deals
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Every Monday at 09:00 AM IST, our engine unlocks flash pricing on 6 premium items across smartphones, laptops, OLED TVs, and inverter appliances. Click Claim Deal to automatically apply VIP savings at checkout.
              </p>
            </div>

            {/* Countdown & Coupon Module */}
            <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
              <DealsCountdown />
              <DealsCouponBar couponCode={couponCode} />
            </div>
          </div>
        </div>

        {/* FESTIVAL BUMPER OFFER SPOTLIGHT (Active when isBumperDeal = true) */}
        {bumperDeal && (
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/15 border-2 border-amber-400 dark:border-amber-400/80 shadow-2xl shadow-amber-500/20 p-6 sm:p-8 lg:p-10 transition-all">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
              {/* Left Column: Bumper Badges, Title & Savings */}
              <div className="space-y-5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md">
                    <Flame className="w-4 h-4 fill-slate-950 text-slate-950 animate-bounce" />
                    <span>🔥 FESTIVAL BUMPER OFFER — 25% OFF</span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-200/80 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300">
                    {bumperDeal.categoryName}
                  </span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    {bumperDeal.brandName}
                  </span>
                </div>

                <Link href={bumperDeal.productUrl}>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors leading-tight">
                    {bumperDeal.name}
                  </h2>
                </Link>

                {/* Price Display Grid */}
                <div className="flex flex-wrap items-baseline gap-4 pt-1">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">VIP Bumper Deal Price:</span>
                    <span className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                      {formatINR(bumperDeal.dealPriceCents)}
                    </span>
                  </div>

                  <div className="border-l border-slate-300 dark:border-slate-700 pl-4 space-y-0.5">
                    <span className="text-xs text-slate-500 block">Anchor Price:</span>
                    <span className="text-base font-semibold line-through text-slate-400">
                      WAS {formatINR(bumperDeal.anchorPriceCents || bumperDeal.mrpCents)}
                    </span>
                  </div>

                  <div className="border-l border-slate-300 dark:border-slate-700 pl-4 space-y-0.5">
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold block">Instant Savings:</span>
                    <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                      Save {formatINR(bumperDeal.savingsCents)} (FLAT 25% OFF)
                    </span>
                  </div>
                </div>

                {/* 1-Click Claim Action */}
                <div className="pt-2">
                  <ClaimDealButton
                    variantId={bumperDeal.variantId}
                    dealId={dealId}
                    couponCode={couponCode}
                    isBumper={true}
                    product={{
                      id: bumperDeal.id,
                      name: bumperDeal.name,
                      slug: bumperDeal.slug,
                      originalPriceCents: bumperDeal.originalPriceCents,
                      dealPriceCents: bumperDeal.dealPriceCents,
                      mrpCents: bumperDeal.anchorPriceCents || bumperDeal.mrpCents,
                      savingsCents: bumperDeal.savingsCents,
                      discountPercent: bumperDeal.discountPercent,
                      imageUrl: bumperDeal.imageUrl,
                    }}
                    className="w-full sm:w-auto"
                  />
                </div>
              </div>

              {/* Right Column: Product Featured Image */}
              <div className="w-full lg:w-96 shrink-0 flex items-center justify-center">
                <Link
                  href={bumperDeal.productUrl}
                  className="relative w-full h-64 sm:h-80 bg-white rounded-2xl overflow-hidden p-6 border-2 border-amber-300/80 dark:border-amber-500/40 shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center"
                >
                  <Image
                    src={bumperDeal.imageUrl}
                    alt={bumperDeal.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-contain p-4"
                    priority
                  />
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-md">
                    25% OFF
                  </div>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Regular High-Ticket Deals Grid */}
        <div className="space-y-6">
          {bumperDeal && (
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Weekly Curated Category Drops (10% to 20% OFF)
              </h3>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularDeals.map((deal, index) => (
              <div
                key={deal.id || index}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/60 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg flex flex-col justify-between group"
              >
                <div>
                  {/* Category & Brand Header */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                      {deal.categoryName}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {deal.brandName}
                    </span>
                  </div>

                  {/* Product Image */}
                  <Link href={deal.productUrl} className="block relative w-full h-52 mb-4 bg-[#F8FAFC] dark:bg-slate-800/50 rounded-xl overflow-hidden p-4 group-hover:scale-[1.02] transition-transform">
                    <Image
                      src={deal.imageUrl}
                      alt={deal.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain p-2"
                    />
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-xs">
                      {deal.discountPercent}% VIP OFF
                    </div>
                  </Link>

                  {/* Title */}
                  <Link href={deal.productUrl}>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug mb-3">
                      {deal.name}
                    </h3>
                  </Link>

                  {/* Price Display */}
                  <div className="bg-[#F8FAFC] dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 mb-4 space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">VIP Deal Price:</span>
                      <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                        {formatINR(deal.dealPriceCents)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-800">
                      <span>Store MRP:</span>
                      <span className="line-through text-slate-400">{formatINR(deal.mrpCents)}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-0.5 font-bold text-emerald-700 dark:text-emerald-400">
                      <span>Total Savings:</span>
                      <span>{formatINR(deal.savingsCents)}</span>
                    </div>
                  </div>
                </div>

                {/* 1-Click Claim Action */}
                <ClaimDealButton
                  variantId={deal.variantId}
                  dealId={dealId}
                  couponCode={couponCode}
                  product={{
                    id: deal.id,
                    name: deal.name,
                    slug: deal.slug,
                    originalPriceCents: deal.originalPriceCents,
                    dealPriceCents: deal.dealPriceCents,
                    mrpCents: deal.mrpCents,
                    savingsCents: deal.savingsCents,
                    discountPercent: deal.discountPercent,
                    imageUrl: deal.imageUrl,
                  }}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
