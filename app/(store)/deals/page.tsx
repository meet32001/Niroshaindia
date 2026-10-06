import { Container } from "@/components/layout/Container";
import Link from "next/link";
import Image from "next/image";
import { Flame, Sparkles, Tag } from "lucide-react";
import { DealsCountdown } from "@/components/deals/DealsCountdown";
import { DealsCouponBar } from "@/components/deals/DealsCouponBar";
import { ClaimDealButton } from "@/components/deals/ClaimDealButton";
import { selectWeeklyDeals, SelectedDealProduct } from "@/lib/deals/deal-selector";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const metadata = {
  title: "VIP Weekly Deals & Bumper Offers | Nirosha India",
  description: "Exclusive hand-curated high-ticket electronics drops for Nirosha VIP Club members with up to 25% festival savings.",
};

export const dynamic = "force-dynamic";

interface ActiveWeeklyDealsResult {
  deals: SelectedDealProduct[];
  dealId?: number;
  couponCode: string;
  weekNumber: number;
  expiresAt: string;
  isConcluded: boolean;
}

function getDeterministicEndOfWeekSundayIST(): string {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  const dayOfWeek = istTime.getUTCDay(); // 0 is Sunday
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

  const targetYear = istTime.getUTCFullYear();
  const targetMonth = istTime.getUTCMonth();
  const targetDate = istTime.getUTCDate() + daysUntilSunday;
  // 23:59:59.999 IST = 18:29:59.999 UTC
  return new Date(Date.UTC(targetYear, targetMonth, targetDate, 18, 29, 59, 999)).toISOString();
}

async function getActiveWeeklyDeals(): Promise<ActiveWeeklyDealsResult> {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  const startOfYear = new Date(istTime.getUTCFullYear(), 0, 1);
  const pastDaysOfYear = (istTime.getTime() - startOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  const currentCouponCode = `VIP-DROP-WK${weekNumber}`;
  const fallbackExpiresAt = getDeterministicEndOfWeekSundayIST();

  const dayOfWeekIST = istTime.getUTCDay(); // 0 is Sunday, 1 is Monday
  const hoursIST = istTime.getUTCHours();
  // Intermission window: Sunday 23:59:59 IST until Monday 08:59:59 AM IST
  const isIntermission = dayOfWeekIST === 1 && hoursIST < 9;

  try {
    const supabase = supabaseAdmin;

      // Try fetching active drop from weekly_deals table
      const { data: dbDeals, error } = await supabase
        .from("weekly_deals")
        .select("*")
        .eq("is_active", true)
        .order("id", { ascending: false })
        .limit(1);

      if (!error && dbDeals && dbDeals.length > 0) {
        const row = dbDeals[0];
        const rowExpiresAt = row.expires_at ? new Date(row.expires_at).getTime() : 0;
        const isRowExpired = rowExpiresAt > 0 && rowExpiresAt <= now.getTime();

        // If the database row has expired and we have reached or passed Monday 09:00 AM IST,
        // bypass the stale row so the new week drop automatically unlocks via deterministic generator.
        const shouldBypassStaleRow = isRowExpired && !isIntermission;

        if (!shouldBypassStaleRow && Array.isArray(row.products) && row.products.length > 0) {
          const expiresAt = row.expires_at ? new Date(row.expires_at).toISOString() : fallbackExpiresAt;
          const isConcluded = isIntermission || (expiresAt ? new Date(expiresAt).getTime() <= now.getTime() : false);

          let normalizedDeals = row.products;
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const variantIds = row.products.map((p: any) => p.variantId).filter(Boolean);
            if (variantIds.length > 0) {
              const { data: vData } = await supabase
                .from("product_variants")
                .select("id, product:products(id, slug, name)")
                .in("id", variantIds);
              if (vData && vData.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const vMap = new Map();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                vData.forEach((v: any) => {
                  if (v.product) vMap.set(v.id, v.product);
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                normalizedDeals = row.products.map((p: any) => {
                  const parent = vMap.get(p.variantId);
                  if (parent && parent.slug) {
                    return { ...p, id: parent.id, slug: parent.slug };
                  }
                  return p;
                });
              }
            }
          } catch {
            // Keep default products array if query fails
          }

          return {
            deals: normalizedDeals,
            dealId: row.id,
            couponCode: row.coupon_code || currentCouponCode,
            weekNumber,
            expiresAt,
            isConcluded,
          };
        }
      }
    } catch (err) {
      console.warn("[DealsPage] Error querying weekly_deals table, falling back to algorithm:", err);
    }

  // Fallback: Run deterministic selection algorithm directly
  const dynamicDeals = await selectWeeklyDeals();
  const isConcluded = isIntermission;
  return {
    deals: dynamicDeals,
    couponCode: currentCouponCode,
    weekNumber,
    expiresAt: fallbackExpiresAt,
    isConcluded,
  };
}

export default async function DealsPage() {
  const { deals, dealId, couponCode, weekNumber, expiresAt, isConcluded } = await getActiveWeeklyDeals();

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
              <DealsCountdown expiresAt={expiresAt} />
              <DealsCouponBar couponCode={couponCode} isConcluded={isConcluded} />
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
                  {isConcluded ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-stone-800/80 text-stone-300 border border-stone-700 shadow-xs">
                      <span>Deal Concluded</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md">
                      <Flame className="w-4 h-4 fill-slate-950 text-slate-950 animate-bounce" />
                      <span>🔥 FESTIVAL BUMPER OFFER — 25% OFF</span>
                    </div>
                  )}
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-200/80 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300">
                    {bumperDeal.categoryName}
                  </span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    {bumperDeal.brandName}
                  </span>
                  {bumperDeal.variantName && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border border-amber-300 dark:border-amber-500/50 shadow-xs">
                      <Tag className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>Spec / Model: {bumperDeal.variantName}</span>
                    </div>
                  )}
                </div>

                <Link href={`/product/${bumperDeal.slug}${bumperDeal.variantId ? `?variant=${bumperDeal.variantId}` : ""}`}>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors leading-tight">
                    {bumperDeal.name}
                  </h2>
                </Link>

                {/* Price Display Grid */}
                {isConcluded ? (
                  <div className="flex flex-wrap items-baseline gap-4 pt-1">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 block">Catalog Price:</span>
                      <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                        {formatINR(bumperDeal.originalPriceCents)}
                      </span>
                    </div>
                    <div className="border-l border-slate-300 dark:border-slate-700 pl-4 space-y-0.5">
                      <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold block">VIP Deal Status:</span>
                      <span className="text-sm font-medium text-slate-500">
                        Flash 25% VIP savings concluded
                      </span>
                    </div>
                  </div>
                ) : (
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
                )}

                {/* 1-Click Claim Action */}
                <div className="pt-2">
                  <ClaimDealButton
                    variantId={bumperDeal.variantId}
                    dealId={dealId}
                    couponCode={couponCode}
                    isBumper={true}
                    isConcluded={isConcluded}
                    slug={bumperDeal.slug}
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
                  href={`/product/${bumperDeal.slug}${bumperDeal.variantId ? `?variant=${bumperDeal.variantId}` : ""}`}
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
                  {isConcluded ? (
                    <div className="absolute top-3 right-3 bg-stone-800/90 text-stone-300 border border-stone-700 text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                      Concluded
                    </div>
                  ) : (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-md">
                      25% OFF
                    </div>
                  )}
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
                {isConcluded ? "Weekly Curated Category Drops" : "Weekly Curated Category Drops (10% to 20% OFF)"}
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
                  <Link href={`/product/${deal.slug}${deal.variantId ? `?variant=${deal.variantId}` : ""}`} className="block relative w-full h-52 mb-4 bg-[#F8FAFC] dark:bg-slate-800/50 rounded-xl overflow-hidden p-4 group-hover:scale-[1.02] transition-transform">
                    <Image
                      src={deal.imageUrl}
                      alt={deal.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain p-2"
                    />
                    {isConcluded ? (
                      <div className="absolute top-2 right-2 bg-stone-800/80 text-stone-300 border border-stone-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-xs">
                        Concluded
                      </div>
                    ) : (
                      <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-xs">
                        {deal.discountPercent}% VIP OFF
                      </div>
                    )}
                  </Link>

                  {/* Title */}
                  <Link href={`/product/${deal.slug}${deal.variantId ? `?variant=${deal.variantId}` : ""}`}>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug mb-2">
                      {deal.name}
                    </h3>
                  </Link>

                  {/* Variant Spec Badge */}
                  {deal.variantName && (
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        <Tag className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate max-w-[210px]">{deal.variantName}</span>
                      </span>
                    </div>
                  )}

                  {/* Price Display */}
                  {isConcluded ? (
                    <div className="bg-[#F8FAFC] dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 mb-4 space-y-1.5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-400">Regular Price:</span>
                        <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                          {formatINR(deal.originalPriceCents)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-800">
                        <span>VIP Deal Status:</span>
                        <span className="text-stone-500 font-medium">Flash discount concluded</span>
                      </div>
                    </div>
                  ) : (
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
                  )}
                </div>

                {/* 1-Click Claim Action */}
                <ClaimDealButton
                  variantId={deal.variantId}
                  dealId={dealId}
                  couponCode={couponCode}
                  isConcluded={isConcluded}
                  slug={deal.slug}
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
