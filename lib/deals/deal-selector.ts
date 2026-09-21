import { createClient } from "@supabase/supabase-js";

export interface DealRecord {
  productId: number;
  variantId: number;
  originalPriceCents: number;
  anchorPriceCents: number;
  dealPriceCents: number;
  discountPercent: number;
  isBumperDeal: boolean;
}

export interface SelectedDealProduct {
  id: number;
  variantId: number;
  name: string;
  slug: string;
  brandName: string;
  categoryName: string;
  categorySlug: string;
  originalPriceCents: number;
  anchorPriceCents: number;
  mrpCents: number;
  dealPriceCents: number;
  savingsCents: number;
  discountPercentage: number;
  discountPercent: number;
  isBumperDeal: boolean;
  imageUrl: string;
  productUrl: string;
}

/**
 * Determines whether the current calendar week qualifies for the Bi-Weekly Festival Bumper Deal:
 * - Active ONLY between September 1 and December 31 (months 8 to 11 in 0-indexed JS Date).
 * - Triggers on alternate weeks (even week numbers of the year).
 */
export function isBiweeklyFestivalBumperEligible(date: Date = new Date()): boolean {
  const month = date.getMonth(); // 8 = Sep, 9 = Oct, 10 = Nov, 11 = Dec
  const isFestivalMonths = month >= 8 && month <= 11;
  if (!isFestivalMonths) return false;

  // Determine week of year
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  const currentWeek = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

  // Bi-weekly: triggers on even weeks (e.g. Week 38, 40, 42, etc.)
  return currentWeek % 2 === 0;
}

/**
 * Standard discount logic:
 * - Products > ₹2,00,000: strictly 10% to 15% (margin safety)
 * - Products <= ₹2,00,000: strictly 15% to 20%
 */
export function calculateStandardDealDiscount(priceCents: number): number {
  const TWO_LAKHS_CENTS = 20000000;
  if (priceCents > TWO_LAKHS_CENTS) {
    return Math.floor(Math.random() * (15 - 10 + 1)) + 10; // 10% to 15%
  }
  return Math.floor(Math.random() * (20 - 15 + 1)) + 15; // 15% to 20%
}

// 6 Target High-Ticket Category Buckets (Always 6 base distinct items)
export const HIGH_TICKET_BUCKETS = [
  {
    family: "Smartphones & Foldables",
    slugs: ["smartphones", "tablets-ipads"],
    fallbackName: "Flagship 5G Smartphone",
  },
  {
    family: "Laptops & High-Performance Computing",
    slugs: ["laptops-macbooks", "gaming-laptops", "laptops-ultrabooks", "monitors-desktops"],
    fallbackName: "Premium Gaming / Ultra Laptop",
  },
  {
    family: "4K & OLED Smart Entertainment",
    slugs: ["4k-oled-smart-tvs", "4k-smart-tvs", "televisions"],
    fallbackName: "Cinematic 4K OLED Smart TV",
  },
  {
    family: "Climate Comfort & Air Conditioners",
    slugs: ["air-conditioners", "split-air-conditioners", "window-air-conditioners"],
    fallbackName: "Inverter Split Air Conditioner",
  },
  {
    family: "Frost-Free Refrigerators & Appliances",
    slugs: ["refrigerators", "washing-machines"],
    fallbackName: "Double-Door Inverter Refrigerator",
  },
  {
    family: "Premium Audio & Soundbars",
    slugs: ["soundbars-home-theatres", "party-speakers", "headphones", "bluetooth-speakers"],
    fallbackName: "Dolby Atmos Premium Soundbar",
  },
];

export function getPlaceholderDeals(targetDate: Date = new Date()): SelectedDealProduct[] {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://niroshaindia.com";
  const defaultImages = [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
  ];

  const deals: SelectedDealProduct[] = HIGH_TICKET_BUCKETS.map((b, idx) => {
    const originalPriceCents = (120000 + idx * 25000) * 100;
    const discount = 15;
    const dealPriceCents = Math.round(originalPriceCents * (1 - discount / 100));
    const slug = b.fallbackName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return {
      id: 9900 + idx,
      variantId: 9900 + idx,
      name: b.fallbackName,
      slug,
      brandName: "Nirosha Elite",
      categoryName: b.family,
      categorySlug: b.slugs[0] || "deals",
      originalPriceCents,
      anchorPriceCents: originalPriceCents,
      mrpCents: originalPriceCents,
      dealPriceCents,
      savingsCents: originalPriceCents - dealPriceCents,
      discountPercentage: discount,
      discountPercent: discount,
      isBumperDeal: false,
      imageUrl: defaultImages[idx % defaultImages.length],
      productUrl: `${baseUrl}/product/${slug}`,
    };
  });

  if (isBiweeklyFestivalBumperEligible(targetDate)) {
    const bumperOriginal = 17500000;
    const anchor = Math.round(bumperOriginal * 1.15);
    const bumperDealPrice = Math.round(anchor * 0.75);
    const bumperDeal: SelectedDealProduct = {
      id: 9899,
      variantId: 9899,
      name: "Apple iPhone 16 Pro Max",
      slug: "apple-iphone-16-pro-max",
      brandName: "Apple",
      categoryName: "Festival Spotlight",
      categorySlug: "smartphones",
      originalPriceCents: bumperOriginal,
      anchorPriceCents: anchor,
      mrpCents: anchor,
      dealPriceCents: bumperDealPrice,
      savingsCents: anchor - bumperDealPrice,
      discountPercentage: 25,
      discountPercent: 25,
      isBumperDeal: true,
      imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
      productUrl: `${baseUrl}/product/apple-iphone-16-pro-max`,
    };
    return [bumperDeal, ...deals];
  }

  return deals;
}

/**
 * Generates the weekly deals batch:
 * - Always 6 distinct category high-ticket items.
 * - If isBiweeklyFestivalBumperEligible(date) is true: adds a 7th Bumper item (< ₹2 Lakhs)
 *   with +15% anchor markup and 25% promo discount (yielding ~13.75% real markdown).
 */
export async function selectWeeklyDeals(targetDate: Date = new Date()): Promise<SelectedDealProduct[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("placeholder")) {
    return getPlaceholderDeals(targetDate);
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const baseDeals: SelectedDealProduct[] = [];
    const usedProductIds = new Set<number>();

    // 1. Fetch 6 distinct category items (standard base pool)
    for (const bucket of HIGH_TICKET_BUCKETS) {
      const { data: variants, error } = await supabase
        .from("product_variants")
        .select(`
          id,
          price_cents,
          compare_at_price_cents,
          product:products!inner(
            id,
            name,
            slug,
            is_active,
            brand:brands(id, name, slug),
            category:categories!inner(id, name, slug)
          )
        `)
        .in("product.category.slug", bucket.slugs)
        .eq("product.is_active", true)
        .gte("price_cents", 2000000)
        .order("price_cents", { ascending: false })
        .limit(20);

      if (error || !variants || variants.length === 0) {
        // Fallback: If no ₹20k item exists in this specific child bucket, try ₹10k+ floor
        const { data: fallbackVariants } = await supabase
          .from("product_variants")
          .select(`
            id,
            price_cents,
            compare_at_price_cents,
            product:products!inner(
              id,
              name,
              slug,
              is_active,
              brand:brands(id, name, slug),
              category:categories!inner(id, name, slug)
            )
          `)
          .in("product.category.slug", bucket.slugs)
          .eq("product.is_active", true)
          .gte("price_cents", 1000000)
          .order("price_cents", { ascending: false })
          .limit(10);

        if (fallbackVariants && fallbackVariants.length > 0) {
          await assignStandardDeal(fallbackVariants, bucket, usedProductIds, baseDeals, supabase);
        }
        continue;
      }

      await assignStandardDeal(variants, bucket, usedProductIds, baseDeals, supabase);
    }

    // Backfill any missing slots from fallback if catalog is sparse
    if (baseDeals.length < 6) {
      const placeholders = getPlaceholderDeals(targetDate);
      for (const ph of placeholders) {
        if (!ph.isBumperDeal && !usedProductIds.has(ph.id) && baseDeals.length < 6) {
          baseDeals.push(ph);
        }
      }
    }

    // 2. Check Bi-Weekly Festival Bumper Deal (The 7th Product)
    const isBumperActive = isBiweeklyFestivalBumperEligible(targetDate);
    if (isBumperActive) {
      const bumperDeal = await fetchSeventhBumperProduct(supabase, usedProductIds);
      if (bumperDeal) {
        return [bumperDeal, ...baseDeals];
      }
    }

    // Standard Week: Exactly 6 deals
    return baseDeals;
  } catch (err) {
    console.warn("[selectWeeklyDeals] Database query failed, using placeholder deals:", err);
    return getPlaceholderDeals(targetDate);
  }
}

/**
 * Assigns one standard deal from candidate variants
 */
async function assignStandardDeal(
  variants: any[],
  bucket: (typeof HIGH_TICKET_BUCKETS)[0],
  usedProductIds: Set<number>,
  selectedDeals: SelectedDealProduct[],
  supabase: any
) {
  const candidateVariants = variants.filter(
    (v) => v.product && !usedProductIds.has(v.product.id)
  );

  if (candidateVariants.length === 0) return;

  const randomIndex = Math.floor(Math.random() * Math.min(candidateVariants.length, 5));
  const chosenVariant = candidateVariants[randomIndex];
  const product = chosenVariant.product;

  usedProductIds.add(product.id);

  // Fetch product image
  const { data: images } = await supabase
    .from("product_images")
    .select("image_url, is_featured, sort_order")
    .eq("variant_id", chosenVariant.id)
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .limit(1);

  const imageUrl =
    images && images[0]?.image_url
      ? images[0].image_url
      : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";

  const originalPriceCents = chosenVariant.price_cents;
  const mrpCents =
    chosenVariant.compare_at_price_cents && chosenVariant.compare_at_price_cents > originalPriceCents
      ? chosenVariant.compare_at_price_cents
      : Math.round(originalPriceCents * 1.15);

  const discountPercent = calculateStandardDealDiscount(originalPriceCents);
  const dealPriceCents = Math.round(originalPriceCents * (1 - discountPercent / 100));
  const totalSavingsCents = mrpCents - dealPriceCents;
  const discountPercentage = Math.round((totalSavingsCents / mrpCents) * 100);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://niroshaindia.com";

  selectedDeals.push({
    id: product.id,
    variantId: chosenVariant.id,
    name: product.name,
    slug: product.slug,
    brandName: product.brand?.name || "Official Brand",
    categoryName: bucket.family,
    categorySlug: product.category?.slug || bucket.slugs[0],
    originalPriceCents,
    anchorPriceCents: mrpCents,
    mrpCents,
    dealPriceCents,
    savingsCents: totalSavingsCents,
    discountPercentage,
    discountPercent,
    isBumperDeal: false,
    imageUrl,
    productUrl: `${baseUrl}/product/${product.slug}`,
  });
}

/**
 * Fetches the 7th Bumper Product:
 * - Constraint: price strictly < ₹2,00,000 (20,000,000 cents) and >= ₹20,000.
 * - Markup Formula:
 *   * Anchor Price = P * 1.15 (+15% markup)
 *   * Customer Deal Price = Anchor Price * 0.75 (25% off anchor)
 *   * Effective real markdown = ~13.75%
 */
async function fetchSeventhBumperProduct(
  supabase: any,
  usedProductIds: Set<number>
): Promise<SelectedDealProduct | null> {
  const TWO_LAKHS_CENTS = 20000000;
  const TWENTY_THOUSAND_CENTS = 2000000;

  const { data: bumperCandidates, error } = await supabase
    .from("product_variants")
    .select(`
      id,
      price_cents,
      compare_at_price_cents,
      product:products!inner(
        id,
        name,
        slug,
        is_active,
        brand:brands(id, name, slug),
        category:categories(id, name, slug)
      )
    `)
    .eq("product.is_active", true)
    .gte("price_cents", TWENTY_THOUSAND_CENTS)
    .lt("price_cents", TWO_LAKHS_CENTS)
    .order("price_cents", { ascending: false })
    .limit(30);

  if (error || !bumperCandidates || bumperCandidates.length === 0) {
    return null;
  }

  // Filter out any products already selected in the 6 base deals
  const eligibleCandidates = bumperCandidates.filter(
    (v: any) => v.product && !usedProductIds.has(v.product.id)
  );

  if (eligibleCandidates.length === 0) return null;

  // Pick a candidate
  const randomIndex = Math.floor(Math.random() * Math.min(eligibleCandidates.length, 10));
  const chosenVariant = eligibleCandidates[randomIndex];
  const product = chosenVariant.product;

  usedProductIds.add(product.id);

  // Fetch product image
  const { data: images } = await supabase
    .from("product_images")
    .select("image_url, is_featured, sort_order")
    .eq("variant_id", chosenVariant.id)
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .limit(1);

  const imageUrl =
    images && images[0]?.image_url
      ? images[0].image_url
      : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";

  const originalPriceCents = chosenVariant.price_cents;

  // Strategic +15% Markup Engine
  // 1. Inflate baseline by 15% to create anchor
  const inflatedAnchorCents = Math.round(originalPriceCents * 1.15);
  // 2. Apply 25% off inflated anchor
  const bumperDealPriceCents = Math.round(inflatedAnchorCents * 0.75);
  // 3. User sees 25% savings against the anchor
  const totalSavingsCents = inflatedAnchorCents - bumperDealPriceCents;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://niroshaindia.com";

  return {
    id: product.id,
    variantId: chosenVariant.id,
    name: product.name,
    slug: product.slug,
    brandName: product.brand?.name || "Official Brand",
    categoryName: product.category?.name || "Festival Spotlight",
    categorySlug: product.category?.slug || "deals",
    originalPriceCents,
    anchorPriceCents: inflatedAnchorCents,
    mrpCents: inflatedAnchorCents,
    dealPriceCents: bumperDealPriceCents,
    savingsCents: totalSavingsCents,
    discountPercentage: 25,
    discountPercent: 25,
    isBumperDeal: true,
    imageUrl,
    productUrl: `${baseUrl}/product/${product.slug}`,
  };
}

/**
 * Standalone batch generator returning DealRecord format for external scripts/pipelines
 */
export async function generateWeeklyDealsBatch(date: Date = new Date()): Promise<DealRecord[]> {
  const selected = await selectWeeklyDeals(date);
  return selected.map((d) => ({
    productId: d.id,
    variantId: d.variantId,
    originalPriceCents: d.originalPriceCents,
    anchorPriceCents: d.anchorPriceCents,
    dealPriceCents: d.dealPriceCents,
    discountPercent: d.discountPercent,
    isBumperDeal: d.isBumperDeal,
  }));
}
