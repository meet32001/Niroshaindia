import { createClient } from "@supabase/supabase-js";

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
  imageUrl: string;
  productUrl: string;
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
        assignDealFromVariants(fallbackVariants, bucket, usedProductIds, selectedDeals, supabase);
      }
      continue;
    }

    await assignDealFromVariants(variants, bucket, usedProductIds, selectedDeals, supabase);
  }

  return selectedDeals;
}

async function assignDealFromVariants(
  variants: any[],
  bucket: (typeof HIGH_TICKET_BUCKETS)[0],
  usedProductIds: Set<number>,
  selectedDeals: SelectedDealProduct[],
  supabase: any
) {
  // Filter out products already chosen
  const candidateVariants = variants.filter(
    (v) => v.product && !usedProductIds.has(v.product.id)
  );

  if (candidateVariants.length === 0) return;

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
  const mrpCents = chosenVariant.compare_at_price_cents && chosenVariant.compare_at_price_cents > originalPriceCents
    ? chosenVariant.compare_at_price_cents
    : Math.round(originalPriceCents * 1.15); // Authentic benchmark MRP

  // Calculate VIP Deal Discount: 8% to 12% extra off rounded to nearest ₹100 (10,000 paise)
  const discountRate = 0.08 + (Math.random() * 0.04); // 8% - 12%
  const rawDiscount = originalPriceCents * discountRate;
  const roundedDiscount = Math.round(rawDiscount / 10000) * 10000;
  const dealPriceCents = Math.max(1000000, originalPriceCents - roundedDiscount);
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
    imageUrl,
    productUrl: `${baseUrl}/product/${product.slug}`,
  });
}
