import { createClient } from "@supabase/supabase-js";

export interface GeneratedDeal {
  productId: number;
  variantId: number;
  originalPriceCents: number;
  discountPercent: number;
  dealPriceCents: number;
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
 * Calculates rule-based discount according to price tier & festival calendar:
 * - > ₹2,00,000: Strictly 10% to 15% (margin-protective ceiling)
 * - Festival season (Sep-Dec): Rare 25% Bumper Offer (max 1 per batch, items <= ₹2 Lakhs)
 * - <= ₹2,00,000 standard: 15% to 20%
 * - Hard ceiling: No deal will ever exceed 25% under any circumstances
 */
export function calculateDealDiscount(
  priceCents: number,
  canHaveBumper: boolean
): { discountPercent: number; isBumper: boolean } {
  const currentMonth = new Date().getMonth(); // 8 = Sep, 9 = Oct, 10 = Nov, 11 = Dec
  const isFestivalSeason = currentMonth >= 8 && currentMonth <= 11;
  const TWO_LAKHS_CENTS = 20000000;

  // 1. Products > 2 Lakhs: Strictly 10% to 15%
  if (priceCents > TWO_LAKHS_CENTS) {
    const discount = Math.floor(Math.random() * (15 - 10 + 1)) + 10;
    return { discountPercent: discount, isBumper: false };
  }

  // 2. Festival season rare Bumper Offer (25% max, only on items <= 2 Lakhs)
  if (canHaveBumper && isFestivalSeason && Math.random() < 0.25) {
    return { discountPercent: 25, isBumper: true };
  }

  // 3. Standard items <= 2 Lakhs: 15% to 20%
  const discount = Math.floor(Math.random() * (20 - 15 + 1)) + 15;
  return { discountPercent: discount, isBumper: false };
}

// 6 Target High-Ticket Category Buckets
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

export async function selectWeeklyDeals(): Promise<SelectedDealProduct[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase credentials in environment");
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const selectedDeals: SelectedDealProduct[] = [];
  const usedProductIds = new Set<number>();
  let hasBumperDeal = false;

  for (const bucket of HIGH_TICKET_BUCKETS) {
    // Query high-ticket variants within this category bucket (min ₹20,000 = 2,000,000 paise)
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
        const assigned = await assignDealFromVariants(
          fallbackVariants,
          bucket,
          usedProductIds,
          selectedDeals,
          supabase,
          !hasBumperDeal
        );
        if (assigned?.isBumperDeal) hasBumperDeal = true;
      }
      continue;
    }

    const assigned = await assignDealFromVariants(
      variants,
      bucket,
      usedProductIds,
      selectedDeals,
      supabase,
      !hasBumperDeal
    );
    if (assigned?.isBumperDeal) hasBumperDeal = true;
  }

  // Festival Season Guarantee Check: If festival season (Sept-Dec) and 25% chance was rolled
  // but not yet assigned, designate at most 1 item under 2 Lakhs as bumper
  const currentMonth = new Date().getMonth();
  const isFestivalSeason = currentMonth >= 8 && currentMonth <= 11;
  if (!hasBumperDeal && isFestivalSeason && Math.random() < 0.25) {
    const eligibleForBumper = selectedDeals.find(
      (d) => d.originalPriceCents <= 20000000
    );
    if (eligibleForBumper) {
      eligibleForBumper.discountPercent = 25;
      eligibleForBumper.isBumperDeal = true;
      eligibleForBumper.dealPriceCents = Math.round(
        eligibleForBumper.originalPriceCents * (1 - 25 / 100)
      );
      eligibleForBumper.savingsCents =
        eligibleForBumper.mrpCents - eligibleForBumper.dealPriceCents;
      eligibleForBumper.discountPercentage = Math.round(
        (eligibleForBumper.savingsCents / eligibleForBumper.mrpCents) * 100
      );
    }
  }

  return selectedDeals;
}

async function assignDealFromVariants(
  variants: any[],
  bucket: (typeof HIGH_TICKET_BUCKETS)[0],
  usedProductIds: Set<number>,
  selectedDeals: SelectedDealProduct[],
  supabase: any,
  canHaveBumper: boolean
): Promise<{ isBumperDeal: boolean } | null> {
  // Filter out products already chosen
  const candidateVariants = variants.filter(
    (v) => v.product && !usedProductIds.has(v.product.id)
  );

  if (candidateVariants.length === 0) return null;

  // Pick a random candidate from top candidates for fresh weekly rotation
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
      : Math.round(originalPriceCents * 1.15); // Authentic benchmark MRP

  // Calculate rule-governed discount
  const { discountPercent, isBumper } = calculateDealDiscount(
    originalPriceCents,
    canHaveBumper
  );

  // dealPriceCents = Math.round(originalPriceCents * (1 - discountPercent / 100))
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
    mrpCents,
    dealPriceCents,
    savingsCents: totalSavingsCents,
    discountPercentage,
    discountPercent,
    isBumperDeal: isBumper,
    imageUrl,
    productUrl: `${baseUrl}/product/${product.slug}`,
  });

  return { isBumperDeal: isBumper };
}
