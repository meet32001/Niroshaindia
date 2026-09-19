import { Container } from "@/components/layout/Container";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight, ShieldCheck, Truck, RefreshCw, CreditCard, Flame } from "lucide-react";
import { DealsCountdown } from "@/components/deals/DealsCountdown";
import { DealsCouponBar } from "@/components/deals/DealsCouponBar";
import { selectWeeklyDeals, SelectedDealProduct } from "@/lib/deals/deal-selector";
import { createClient } from "@supabase/supabase-js";

export const metadata = {
  title: "VIP Weekly Deals | Nirosha India",
  description: "Exclusive hand-curated high-ticket electronics drops for Nirosha VIP Club members. Valid for 7 days only.",
};

export const revalidate = 3600; // Refresh every hour

async function getActiveWeeklyDeals(): Promise<{ deals: SelectedDealProduct[]; couponCode: string; weekNumber: number }> {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  const currentCouponCode = `VIP-DROP-WK${weekNumber}`;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      // Try fetching from weekly_deals table
      const { data: dbDeals, error } = await supabase
        .from("weekly_deals")
        .select(`
          id,
          week_number,
          deal_price_cents,
          coupon_code,
          product:products!inner(
            id,
            name,
            slug,
            brand:brands(id, name, slug),
            category:categories(id, name, slug),
            variants:product_variants(
              id,
              price_cents,
              compare_at_price_cents,
              images:product_images(image_url, is_featured)
            )
          )
        `)
        .lte("starts_at", now.toISOString())
        .gte("expires_at", now.toISOString())
        .limit(6);

      if (!error && dbDeals && dbDeals.length > 0) {
        const mappedDeals: SelectedDealProduct[] = dbDeals.map((d: any) => {
          const product = d.product;
          const variant = product.variants?.[0] || {};
          const image = variant.images?.find((img: any) => img.is_featured)?.image_url ||
            variant.images?.[0]?.image_url ||
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";

          const originalPriceCents = variant.price_cents || d.deal_price_cents;
          const mrpCents = variant.compare_at_price_cents || Math.round(originalPriceCents * 1.15);
          const dealPriceCents = Number(d.deal_price_cents);
          const savingsCents = mrpCents - dealPriceCents;
          const discountPercentage = Math.round((savingsCents / mrpCents) * 100);

          return {
            id: product.id,
            variantId: variant.id || 0,
            name: product.name,
            slug: product.slug,
            brandName: product.brand?.name || "Official Brand",
            categoryName: product.category?.name || "High-Ticket Tech",
            categorySlug: product.category?.slug || "electronics",
            originalPriceCents,
            mrpCents,
            dealPriceCents,
            savingsCents,
            discountPercentage,
            imageUrl: image,
            productUrl: `/product/${product.slug}`,
          };
        });

        return {
          deals: mappedDeals,
          couponCode: dbDeals[0]?.coupon_code || currentCouponCode,
          weekNumber,
        };
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
  const { deals, couponCode, weekNumber } = await getActiveWeeklyDeals();

  const formatINR = (cents: number) => {
    return "₹" + Math.round(cents / 100).toLocaleString("en-IN");
  };

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
                6 Hand-Curated High-Ticket Deals
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Every Monday, our curation engine unlocks exclusive flash pricing on 6 premium high-ticket items across smartphones, computing, OLED TVs, and inverter appliances.
              </p>
            </div>

            {/* Countdown & Coupon Module */}
            <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
              <DealsCountdown />
              <DealsCouponBar couponCode={couponCode} />
            </div>
          </div>
        </div>

        {/* 6 High-Ticket Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal, index) => (
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
                  <div className="absolute top-2 right-2 bg-rose-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-xs">
                    {deal.discountPercentage}% OFF
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

              {/* Action Button */}
              <Link
                href={deal.productUrl}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#166534] hover:bg-[#15803d] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md cursor-pointer"
              >
                <span>Claim VIP Deal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Trust Anchors Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">100% Genuine</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Direct Brand Warranty</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <Truck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Pan-India Express</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">19,000+ Pincodes</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <RefreshCw className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">7-Day Replacement</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Hassle-Free Guarantee</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <CreditCard className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Flexible No-Cost EMI</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Leading Indian Banks</div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
