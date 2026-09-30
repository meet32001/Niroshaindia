import { supabase } from "@/lib/supabase/client";
import { Product, Category, Brand } from "@/types";

export const CATEGORY_SLUG_ALIASES: Record<string, string | string[]> = {
  // Laptops & Computers
  "laptops-computers": "laptops-accessories",
  "laptops-pcs": "laptops-accessories",
  "laptops-workstations": "laptops-accessories",
  "laptops": "laptops-macbooks",
  "laptops-ultrabooks": "laptops-macbooks",

  // Smart Televisions
  "smart-televisions": "televisions-audio",
  "tv-vision": "televisions-audio",
  "televisions": "televisions-audio",

  // Mobiles & Smartphones
  "smartphones-tablets": ["smartphones", "tablets-ipads"],
  "mobiles-tablets": ["smartphones", "tablets-ipads"],
  "mobile-phones": "smartphones",
  "mobiles": "smartphones",

  // Kitchen Chimneys & Appliances
  "home-kitchen": "kitchen-chimneys",
  "kitchen": "kitchen-appliances",
  "air-fryers-deep-fryers": "air-fryers",
  "electric-kettles-coffee-makers": "kettles-coffee-makers",
  "induction-cooktops-stoves": "cooktops-stoves",
  "mixer-grinders-juicers-blenders": "mixers-juicers-blenders",

  // Audio & Headphones
  "headphones-audio": "headphones-speakers",
  "audio-headphones": "headphones-speakers",
  "headphones-tws": "headphones-speakers",
  "audio": "headphones-speakers",
  "gadget": "headphones-speakers",
  "gadgets": "headphones-speakers",

  // Home Appliances & Wearables
  "appliances": "home-appliances",
  "wearables": "smartwatches-wearables",
  "smart-wearables": "smartwatches-wearables",
};

export const MOCK_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    title: "Gadgets & Accessories",
    name: "Gadgets & Accessories",
    slug: "gadgets",
    icon: "Headphones",
    productCount: 12,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "cat-2",
    title: "Smart Appliances",
    name: "Smart Appliances",
    slug: "appliances",
    icon: "Tv",
    productCount: 8,
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "cat-3",
    title: "Refrigerators",
    name: "Refrigerators",
    slug: "refrigerators",
    icon: "Refrigerator",
    productCount: 6,
    image: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "cat-4",
    title: "Other Electronics",
    name: "Other Electronics",
    slug: "others",
    icon: "Cpu",
    productCount: 15,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
  },
];

export const MOCK_BRANDS: Brand[] = [
  { id: "b-1", title: "Apple", name: "Apple", slug: "apple", image: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
  { id: "b-2", title: "Sony", name: "Sony", slug: "sony", image: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg" },
  { id: "b-3", title: "Dell", name: "Dell", slug: "dell", image: "https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_2016.svg" },
  { id: "b-4", title: "HP", name: "HP", slug: "hp", image: "https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg" },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "mock-1",
    title: "Nirosha Sonic Pro Noise-Cancelling Headphones",
    name: "Nirosha Sonic Pro Noise-Cancelling Headphones",
    slug: "nirosha-sonic-pro-headphones",
    category: "Gadgets & Accessories",
    price: 4999,
    discountPrice: 8999,
    rating: 4.9,
    reviewsCount: 420,
    stockStatus: "in_stock",
    brand: "Nirosha",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"],
    description: "Flagship wireless active noise cancelling headphones with 40-hour battery life and fast charging.",
    tag: "hot",
  },
  {
    id: "mock-2",
    title: "ProBook Ultra M3 16-inch Gaming Laptop",
    name: "ProBook Ultra M3 16-inch Gaming Laptop",
    slug: "probook-ultra-m3-laptop",
    category: "Other Electronics",
    price: 94999,
    discountPrice: 119999,
    rating: 4.8,
    reviewsCount: 154,
    stockStatus: "in_stock",
    brand: "ProBook",
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80"],
    description: "Ultra-slim workstation with 165Hz QHD AMOLED display and RTX graphics.",
    tag: "hot",
  },
  {
    id: "mock-3",
    title: "Smart Frost-Free Double Door Refrigerator 340L",
    name: "Smart Frost-Free Double Door Refrigerator 340L",
    slug: "smart-frost-free-refrigerator-340l",
    category: "Refrigerators",
    price: 32990,
    discountPrice: 42990,
    rating: 4.7,
    reviewsCount: 88,
    stockStatus: "in_stock",
    brand: "Nirosha Home",
    images: ["https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80"],
    description: "Inverter compressor double door refrigerator with smart Wi-Fi temperature control.",
    tag: "sale",
  },
  {
    id: "mock-4",
    title: "PureFlow 5-in-1 Smart Air Purifier & Humidifier",
    name: "PureFlow 5-in-1 Smart Air Purifier & Humidifier",
    slug: "pureflow-5in1-smart-air-purifier",
    category: "Smart Appliances",
    price: 12499,
    discountPrice: 16999,
    rating: 4.8,
    reviewsCount: 210,
    stockStatus: "in_stock",
    brand: "PureFlow",
    images: ["https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=80"],
    description: "HEPA 13 filter air purifier with app integration and real-time AQI display.",
    tag: "new",
  },
];

// Helper to normalize Supabase PostgreSQL rows into standard UI format
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeProduct(item: any) {
  if (!item) return null;

  const defaultFallbackImg =
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";

  const brandObj = item.brand || item.brands;
  const brandName = typeof brandObj === "string" ? brandObj : brandObj?.name || brandObj?.title || "Nirosha";

  const catObj = item.category || item.categories;
  const categoryName = typeof catObj === "string" ? catObj : catObj?.name || catObj?.title || "Electronics";

  const rawVariants = item.variants || item.product_variants || [];
  if (!Array.isArray(rawVariants) || rawVariants.length === 0) {
    if (!item.price || item.price <= 0) {
      return null;
    }
  }
  
  // Normalize each variant cleanly
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variants = rawVariants.map((v: any) => {
    const rawImgs = v.images || v.product_images || [];
    let variantImages: string[] = [];
    if (Array.isArray(rawImgs)) {
      variantImages = rawImgs
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((img: any) => img.image_url || img.url || (typeof img === "string" ? img : null))
        .filter(Boolean);
    }
    if (variantImages.length === 0) {
      variantImages = [defaultFallbackImg];
    }

    const priceCents = v.price_cents ?? (item.price ? item.price * 100 : 0);
    const comparePriceCents = v.compare_at_price_cents ?? (item.discountPrice ? item.discountPrice * 100 : 0);

    const price = priceCents ? priceCents / 100 : item.price || 0;
    const comparePrice = comparePriceCents ? comparePriceCents / 100 : item.discountPrice || 0;

    const rawSpecs = v.specifications?.specs || (Array.isArray(v.specifications) ? v.specifications[0]?.specs : null) || v.product_specifications?.specs || (Array.isArray(v.product_specifications) ? v.product_specifications[0]?.specs : null) || {};

    const inv = Array.isArray(v.inventory) ? v.inventory[0] : v.inventory || (Array.isArray(v.warehouse_inventory) ? v.warehouse_inventory[0] : v.warehouse_inventory);
    const stock = inv ? Math.max(0, (inv.quantity_on_hand || 0) - (inv.quantity_reserved || 0)) : (v.stock !== undefined ? v.stock : 10);

    return {
      id: v.id || `var-${Math.random()}`,
      sku: v.sku || "SKU-DEFAULT",
      name: v.name || item.name || "Default Variant",
      price_cents: priceCents,
      compare_at_price_cents: comparePriceCents,
      price,
      comparePrice,
      stock,
      isStock: stock > 0,
      images: variantImages,
      specs: rawSpecs,
      weight_grams: v.weight_grams || null,
      dimensions_mm_l_w_h: v.dimensions_mm_l_w_h || null,
    };
  });

  // Sort variants by price_cents ascending so primaryVariant is always the base lowest-price variant
  variants.sort((a: any, b: any) => (a.price_cents || 0) - (b.price_cents || 0));

  const primaryVariant = variants[0] || {
    id: item.id || "var-default",
    sku: "SKU-DEFAULT",
    name: item.name || "Default",
    price: item.price || 0,
    comparePrice: item.discountPrice || 0,
    stock: item.stock !== undefined ? item.stock : 10,
    isStock: (item.stock !== undefined ? item.stock : 10) > 0,
    images: [defaultFallbackImg],
    specs: {},
    weight_grams: null,
    dimensions_mm_l_w_h: null,
  };

  // Pre-calculated cached database prices (min_price_cents, max_price_cents)
  const minPriceCents = item.min_price_cents != null && Number(item.min_price_cents) > 0
    ? Number(item.min_price_cents)
    : (primaryVariant.price_cents || (item.price ? Math.round(item.price * 100) : 0));

  const maxPriceCents = item.max_price_cents != null && Number(item.max_price_cents) > 0
    ? Number(item.max_price_cents)
    : (variants.length > 0 ? Math.max(...variants.map((v: any) => v.price_cents || 0)) : minPriceCents);

  // Directly utilize cached min_price_cents for starting catalog price
  const lowestPrice = minPriceCents > 0
    ? minPriceCents / 100
    : (variants.length > 0 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? Math.min(...variants.map((v: any) => v.price))
      : primaryVariant.price);

  let productImages: string[] = primaryVariant.images;
  if (Array.isArray(item.images) && item.images.length > 0) {
    productImages = item.images;
  }

  // Deterministic realistic rating & review count for high-trust presentation
  const itemIdNum = typeof item.id === "number" ? item.id : parseInt(String(item.id).replace(/[^0-9]/g, "") || "1", 10);
  const deterministicRating = Number((4.1 + ((itemIdNum * 17) % 8) * 0.1).toFixed(1));
  const deterministicReviews = 20 + ((itemIdNum * 31) % 230);

  const rating = item.rating ? Number(item.rating) : deterministicRating;
  const reviewsCount = item.review_count ?? item.reviewsCount ?? deterministicReviews;
  const hasBankOffer = item.has_bank_offer ?? (primaryVariant.price >= 10000);
  const noCostEmi = primaryVariant.price >= 3000;
  const stockStatus = (primaryVariant.stock > 0 ? "in_stock" : "out_of_stock") as "in_stock" | "out_of_stock";

  return {
    ...item,
    id: item.id || item._id,
    variant_id: primaryVariant.id,
    selectedVariant: primaryVariant,
    title: item.name || item.title || "Electronics Product",
    name: item.name || item.title || "Electronics Product",
    slug: typeof item.slug === "string" ? item.slug : item.slug?.current || "product",
    brand: brandName,
    brands: typeof brandObj === "object" ? brandObj : { name: brandName },
    category: categoryName,
    categories: typeof catObj === "object" ? catObj : { name: categoryName },
    price_cents: minPriceCents,
    min_price_cents: minPriceCents,
    max_price_cents: maxPriceCents,
    price: minPriceCents > 0 ? minPriceCents / 100 : primaryVariant.price,
    discountPrice: primaryVariant.comparePrice,
    lowestPrice,
    images: productImages,
    variants,
    product_variants: variants,
    specs: primaryVariant.specs,
    stock: primaryVariant.stock,
    rating,
    reviewsCount,
    stockStatus,
    hasBankOffer,
    noCostEmi,
  };
}

// Fetch all active products matching PostgREST relational schema
export async function getAllProducts(filters: ProductFilterOptions = {}) {
  const hasFilters = Object.keys(filters).length > 0;
  if (hasFilters) {
    const catalogRes = await getShopCatalog({ ...filters, pageSize: 100 });
    return catalogRes.products;
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        description,
        is_active,
        min_price_cents,
        max_price_cents,
        brand:brands ( id, name, slug, logo_url ),
        category:categories ( id, name, slug, description ),
        variants:product_variants (
          id,
          sku,
          name,
          price_cents,
          compare_at_price_cents,
          is_serialized,
          weight_grams,
          dimensions_mm_l_w_h,
          images:product_images ( id, image_url, sort_order, is_featured ),
          specifications:product_specifications ( specs ),
          inventory:warehouse_inventory ( quantity_on_hand, quantity_reserved )
        )
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map(normalizeProduct);
    }
    return MOCK_PRODUCTS.map(normalizeProduct);
  } catch {
    return MOCK_PRODUCTS.map(normalizeProduct);
  }
}

// Fetch single detailed product by slug matching PostgREST schema
export async function getProductBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        description,
        is_active,
        min_price_cents,
        max_price_cents,
        brand:brands ( id, name, slug, logo_url ),
        category:categories ( id, name, slug, description ),
        variants:product_variants (
          id,
          sku,
          name,
          price_cents,
          compare_at_price_cents,
          is_serialized,
          weight_grams,
          dimensions_mm_l_w_h,
          images:product_images ( id, image_url, sort_order, is_featured ),
          specifications:product_specifications ( specs ),
          inventory:warehouse_inventory ( quantity_on_hand, quantity_reserved )
        )
      `)
      .eq("slug", slug)
      .single();

    if (!error && data) {
      return normalizeProduct(data);
    }

    const match = MOCK_PRODUCTS.find((p) => p.slug === slug);
    return match ? normalizeProduct(match) : null;
  } catch {
    const match = MOCK_PRODUCTS.find((p) => p.slug === slug);
    return match ? normalizeProduct(match) : null;
  }
}

// Fetch categories matching PostgREST schema with accurate hierarchical product counts
export async function getCategories(quantity?: number): Promise<Category[]> {
  try {
    const { data: cats, error } = await supabase
      .from("categories")
      .select("id, name, slug, description, parent_id")
      .order("name", { ascending: true });

    if (!error && Array.isArray(cats) && cats.length > 0) {
      // Fetch live product counts per category across all catalog products
      let prods: { category_id: number }[] = [];
      let page = 0;
      while (true) {
        const { data: chunk, error: chunkErr } = await supabase
          .from("products")
          .select("category_id")
          .eq("is_active", true)
          .range(page * 1000, (page + 1) * 1000 - 1);
        if (chunkErr || !chunk || chunk.length === 0) break;
        prods = prods.concat(chunk);
        if (chunk.length < 1000) break;
        page++;
      }

      const counts: Record<string | number, number> = {};
      prods.forEach((p) => {
        if (p.category_id) counts[p.category_id] = (counts[p.category_id] || 0) + 1;
      });

      const parentCats = cats.filter((c) => c.parent_id === null);
      const mapped = parentCats
        .map((parent) => {
          const children = cats
            .filter((child) => child.parent_id === parent.id)
            .map((child) => ({
              id: String(child.id),
              title: child.name,
              name: child.name,
              slug: child.slug,
              description: child.description,
              parent_id: parent.id,
              productCount: counts[child.id] || 0,
              image: (child as { image?: string }).image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
            }))
            .filter((child) => (child.productCount || 0) > 0)
            .sort((a, b) =>
              (a.name || a.title || "").localeCompare(
                b.name || b.title || "",
                undefined,
                { sensitivity: "base" }
              )
            );

          const childTotal = children.reduce((sum, ch) => sum + (ch.productCount || 0), 0);
          const totalProductCount = (counts[parent.id] || 0) + childTotal;

          return {
            id: String(parent.id),
            title: parent.name,
            name: parent.name,
            slug: parent.slug,
            description: parent.description,
            parent_id: null,
            productCount: totalProductCount,
            children,
            image: (parent as { image?: string }).image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
          };
        })
        .filter((cat) => (cat.productCount || 0) > 0)
        .sort((a, b) => (b.productCount || 0) - (a.productCount || 0));

      return quantity ? mapped.slice(0, quantity) : mapped;
    }
    return quantity ? MOCK_CATEGORIES.slice(0, quantity) : MOCK_CATEGORIES;
  } catch {
    return quantity ? MOCK_CATEGORIES.slice(0, quantity) : MOCK_CATEGORIES;
  }
}

// Fetch brands matching PostgREST schema with accurate product counts
export async function getBrands() {
  try {
    const { data: brands, error } = await supabase
      .from("brands")
      .select("id, name, slug, logo_url")
      .order("name", { ascending: true });

    if (!error && Array.isArray(brands) && brands.length > 0) {
      // Fetch live product counts per brand
      const { data: prods } = await supabase.from("products").select("brand_id").eq("is_active", true).limit(10000);
      const counts: Record<string | number, number> = {};
      if (Array.isArray(prods)) {
        prods.forEach((p: { brand_id: number }) => {
          if (p.brand_id) counts[p.brand_id] = (counts[p.brand_id] || 0) + 1;
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped = brands
        .map((b: any) => ({
          ...b,
          title: b.name || b.title,
          image: b.logo_url || b.image,
          productCount: counts[b.id] || 0,
        }))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((b: any) => (b.productCount || 0) > 0)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .sort((a: any, b: any) => (b.productCount || 0) - (a.productCount || 0));

      return mapped;
    }
    return MOCK_BRANDS;
  } catch {
    return MOCK_BRANDS;
  }
}

export const getAllBrands = getBrands;

/**
 * Resolves a category slug (or alias) to a list of matching category IDs.
 * Handles root departments by querying all their child subcategories.
 * Handles aliases that map to multiple categories or root departments.
 */
export async function resolveCategoryIds(categoryParam: string): Promise<number[]> {
  if (!categoryParam || categoryParam === "all") return [];
  const cleanCatSlug = categoryParam.trim().toLowerCase();
  const alias = CATEGORY_SLUG_ALIASES[cleanCatSlug] || cleanCatSlug;
  const targetSlugs = Array.isArray(alias) ? alias : [alias];
  const lookupSlugs = Array.from(new Set([...targetSlugs, cleanCatSlug]));

  const { data: matchedCats } = await supabase
    .from("categories")
    .select("id, parent_id, slug")
    .in("slug", lookupSlugs);

  if (!matchedCats || matchedCats.length === 0) {
    return [];
  }

  const catIds: number[] = [];
  for (const cat of matchedCats) {
    if (cat.parent_id === null) {
      const { data: childCats } = await supabase
        .from("categories")
        .select("id")
        .eq("parent_id", cat.id);
      catIds.push(cat.id, ...(childCats || []).map((c) => c.id));
    } else {
      catIds.push(cat.id);
    }
  }

  return Array.from(new Set(catIds));
}

// Contextual brand facets for category: RPC call with fast fallback
export async function getContextualBrands(categorySlug?: string | null) {
  try {
    // 1. Try RPC function if migration has been executed
    const cleanSlug = categorySlug?.trim().toLowerCase() || null;
    const alias = cleanSlug ? (CATEGORY_SLUG_ALIASES[cleanSlug] || cleanSlug) : null;
    const rpcSlug = Array.isArray(alias) ? alias[0] : (alias || cleanSlug);

    const { data: rpcBrands, error: rpcErr } = await supabase.rpc(
      "get_contextual_category_brands",
      { cat_slug: rpcSlug }
    );

    if (!rpcErr && Array.isArray(rpcBrands) && rpcBrands.length > 0) {
      return rpcBrands.map((b: { brand_id?: number | string; id?: number | string; brand_name?: string; name?: string; title?: string; brand_slug?: string; slug?: string; product_count?: number }) => ({
        id: String(b.brand_id || b.id),
        title: b.brand_name || b.name || b.title,
        name: b.brand_name || b.name,
        slug: b.brand_slug || b.slug,
        productCount: Number(b.product_count || 0),
      }));
    }

    // 2. High-speed resilient fallback
    let targetCatIds: number[] | null = null;
    if (categorySlug && categorySlug !== "all") {
      targetCatIds = await resolveCategoryIds(categorySlug);
    }

    let prodQuery = supabase.from("products").select("brand_id").eq("is_active", true);
    if (targetCatIds && targetCatIds.length > 0) {
      prodQuery = prodQuery.in("category_id", targetCatIds);
    }

    const { data: prods } = await prodQuery.limit(5000);
    const counts: Record<number | string, number> = {};
    prods?.forEach((p: { brand_id: number }) => {
      if (p.brand_id) counts[p.brand_id] = (counts[p.brand_id] || 0) + 1;
    });

    const brandIds = Object.keys(counts);
    if (brandIds.length === 0) return [];

    const { data: brands } = await supabase
      .from("brands")
      .select("id, name, slug, logo_url")
      .in("id", brandIds);

    return (brands || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((b: any) => ({
        id: String(b.id),
        title: b.name,
        name: b.name,
        slug: b.slug,
        image: b.logo_url,
        productCount: counts[b.id] || 0,
      }))
      .filter((b) => b.productCount > 0)
      .sort((a, b) => b.productCount - a.productCount);
  } catch (err) {
    console.error("getContextualBrands error:", err);
    return [];
  }
}

export interface ProductFilterOptions {
  category?: string;
  brand?: string;
  sort?: string;
  minPrice?: number; // In INR or paise
  maxPrice?: number; // In INR or paise
  rating?: number; // e.g. 4.0 or 3.0
  inStockOnly?: boolean;
  bankDiscount?: boolean;
  noCostEmi?: boolean;
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface ShopCatalogParams {
  category?: string | null;
  brand?: string | null; // single or comma-separated slugs
  minPrice?: number | null; // in paise or INR
  maxPrice?: number | null; // in paise or INR
  search?: string | null;
  sort?: string | null; // "newest" | "price_asc" | "price_desc" | "alpha"
  rating?: number | null; // 4.0 or 3.0
  inStockOnly?: boolean | null;
  bankDiscount?: boolean | null;
  noCostEmi?: boolean | null;
  page?: number;
  pageSize?: number;
}

export interface ShopCatalogResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  products: any[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Server-side paginated and filtered catalog fetching from Supabase
export async function getShopCatalog(params: ShopCatalogParams = {}): Promise<ShopCatalogResult> {
  const {
    category,
    brand,
    minPrice,
    maxPrice,
    search,
    sort = "newest",
    rating,
    inStockOnly,
    bankDiscount,
    noCostEmi,
    page = 1,
    pageSize = 24,
  } = params;

  // Convert INR inputs to paise if <= 150000, or use directly if already in paise
  let effectiveMinPaise: number | null = null;
  if (minPrice !== undefined && minPrice !== null && minPrice > 0) {
    effectiveMinPaise = minPrice <= 150000 ? minPrice * 100 : minPrice;
  }
  let effectiveMaxPaise: number | null = null;
  if (maxPrice !== undefined && maxPrice !== null && maxPrice > 0) {
    effectiveMaxPaise = maxPrice <= 150000 ? maxPrice * 100 : maxPrice;
  }

  // Offers thresholds
  if (noCostEmi) {
    effectiveMinPaise = Math.max(effectiveMinPaise || 0, 300000); // >= ₹3,000
  }
  if (bankDiscount) {
    effectiveMinPaise = Math.max(effectiveMinPaise || 0, 1000000); // >= ₹10,000
  }

  try {
    let query = supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        description,
        min_price_cents,
        max_price_cents,
        brand_id,
        category_id,
        brands ( id, name, slug, logo_url ),
        categories ( id, name, slug, description, parent_id ),
        product_variants!inner (
          id,
          sku,
          name,
          price_cents,
          compare_at_price_cents,
          warehouse_inventory ( quantity_on_hand, quantity_reserved ),
          product_images ( id, image_url, sort_order, is_featured )
        )
      `,
        { count: "exact" }
      )
      .eq("is_active", true)
      .gt("product_variants.price_cents", 0);

    // 1. Resolve Category Filter (supports root departments, child subcategories, and aliases)
    if (category) {
      const catIds = await resolveCategoryIds(category);
      if (catIds.length > 0) {
        query = query.in("category_id", catIds);
      } else {
        query = query.eq("category_id", -1); // No match
      }
    }

    // 2. Resolve Brand Filter (direct indexed lookup on products.brand_id)
    if (brand) {
      const brandList = brand
        .split(",")
        .map((b) => b.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ""))
        .filter(Boolean);
      let { data: matchedBrands } = await supabase
        .from("brands")
        .select("id, slug")
        .in("slug", brandList);

      if ((!matchedBrands || matchedBrands.length === 0) && brandList.length > 0) {
        // Fallback: match via ILIKE on slug or name
        const orClauses = brandList.map((b) => `slug.ilike.${b},name.ilike.${b}`).join(",");
        const { data: ilikeBrands } = await supabase
          .from("brands")
          .select("id, slug")
          .or(orClauses);
        matchedBrands = ilikeBrands;
      }

      if (matchedBrands && matchedBrands.length > 0) {
        const brandIds = matchedBrands.map((b) => b.id);
        query = query.in("brand_id", brandIds);
      } else {
        query = query.eq("brand_id", -1); // No match
      }
    }

    // 3. Search filter (sanitized to prevent wildcard or PostgREST operator injection)
    if (search) {
      const sanitizedSearch = search.replace(/[^\w\s-]/g, " ").replace(/\s+/g, " ").trim();
      if (sanitizedSearch) {
        query = query.ilike("name", `%${sanitizedSearch}%`);
      }
    }

    // 4. Price range filter (via joined variants inner join)
    if (effectiveMinPaise !== null && effectiveMinPaise > 0) {
      query = query.gte("product_variants.price_cents", effectiveMinPaise);
    }
    if (effectiveMaxPaise !== null && effectiveMaxPaise > 0) {
      query = query.lte("product_variants.price_cents", effectiveMaxPaise);
    }

    const currentPage = Math.max(1, page);
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    // 5. High-Speed Two-Step Price Sorting (Eliminates PostgREST Join Timeout)
    if (sort === "price_asc" || sort === "price_desc") {
      const isAsc = sort === "price_asc";
      const sortColumn = isAsc ? "min_price_cents" : "max_price_cents";

      // 1. High-speed query directly on products table for IDs and exact count
      let idQuery = supabase
        .from("products")
        .select("id", { count: "exact" })
        .eq("is_active", true)
        .gt("min_price_cents", 0);

      // Resolve Category Filter
      if (category) {
        const catIds = await resolveCategoryIds(category);
        if (catIds.length > 0) {
          idQuery = idQuery.in("category_id", catIds);
        } else {
          idQuery = idQuery.eq("category_id", -1);
        }
      }

      // Resolve Brand Filter
      if (brand) {
        const brandList = brand
          .split(",")
          .map((b) => b.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ""))
          .filter(Boolean);
        let { data: matchedBrands } = await supabase
          .from("brands")
          .select("id, slug")
          .in("slug", brandList);

        if ((!matchedBrands || matchedBrands.length === 0) && brandList.length > 0) {
          const orClauses = brandList.map((b) => `slug.ilike.${b},name.ilike.${b}`).join(",");
          const { data: ilikeBrands } = await supabase
            .from("brands")
            .select("id, slug")
            .or(orClauses);
          matchedBrands = ilikeBrands;
        }

        if (matchedBrands && matchedBrands.length > 0) {
          idQuery = idQuery.in("brand_id", matchedBrands.map((b) => b.id));
        } else {
          idQuery = idQuery.eq("brand_id", -1);
        }
      }

      // Resolve Search Filter (sanitized)
      if (search) {
        const sanitizedSearch = search.replace(/[^\w\s-]/g, " ").replace(/\s+/g, " ").trim();
        if (sanitizedSearch) {
          idQuery = idQuery.ilike("name", `%${sanitizedSearch}%`);
        }
      }

      // Resolve Price Boundaries directly on products min_price_cents
      if (effectiveMinPaise !== null && effectiveMinPaise > 0) {
        idQuery = idQuery.gte("min_price_cents", effectiveMinPaise);
      }
      if (effectiveMaxPaise !== null && effectiveMaxPaise > 0) {
        idQuery = idQuery.lte("min_price_cents", effectiveMaxPaise);
      }

      idQuery = idQuery.order(sortColumn, { ascending: isAsc }).range(from, to);

      const { data: idRows, count: totalRows, error: idErr } = await idQuery;

      if (idErr || !idRows || idRows.length === 0) {
        if (idErr) console.error("Fast price sorting ID query error:", idErr);
        return {
          products: [],
          totalCount: totalRows ?? 0,
          page: currentPage,
          pageSize,
          totalPages: Math.ceil((totalRows ?? 0) / pageSize) || 1,
        };
      }

      const pageProductIds = idRows.map((r) => r.id);

      // Step 2: Fetch full product details only for the current page's products (indexed by PK id)
      const { data: pageProducts, error: pErr } = await supabase
        .from("products")
        .select(`
          id,
          name,
          slug,
          description,
          min_price_cents,
          max_price_cents,
          brand_id,
          category_id,
          brands ( id, name, slug, logo_url ),
          categories ( id, name, slug, description, parent_id ),
          product_variants (
            id,
            sku,
            name,
            price_cents,
            compare_at_price_cents,
            warehouse_inventory ( quantity_on_hand, quantity_reserved ),
            product_images ( id, image_url, sort_order, is_featured )
          )
        `)
        .in("id", pageProductIds);

      if (pErr) {
        console.error("Fast price sorting product fetch error:", pErr);
        return {
          products: [],
          totalCount: totalRows ?? 0,
          page: currentPage,
          pageSize,
          totalPages: Math.ceil((totalRows ?? 0) / pageSize) || 1,
        };
      }

      // Restore exact sorted order from pageProductIds
      const prodMap = new Map((pageProducts || []).map((p) => [p.id, p]));
      const ordered = pageProductIds.map((id) => prodMap.get(id)).filter(Boolean);
      let normalized = ordered.map(normalizeProduct).filter(Boolean);

      if (rating) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        normalized = normalized.filter((p: any) => (p.rating ?? 4.5) >= rating);
      }
      if (inStockOnly) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        normalized = normalized.filter((p: any) => (p.stock ?? 10) > 0);
      }

      const total = totalRows ?? normalized.length;
      return {
        products: normalized,
        totalCount: total,
        page: currentPage,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
      };
    }

    // 6. Alphabetical & Default Newest Sorting
    if (sort === "alpha") {
      query = query.order("name", { ascending: true });
    } else {
      // Order by primary key id (guaranteed indexed B-Tree)
      query = query.order("id", { ascending: false });
    }

    query = query.range(from, to);

    const { data, count, error } = await query;

    if (!error && Array.isArray(data)) {
      let normalized = data.map(normalizeProduct).filter(Boolean);
      if (rating) {
        normalized = normalized.filter((p: any) => (p.rating ?? 4.5) >= rating);
      }
      if (inStockOnly) {
        normalized = normalized.filter((p: any) => (p.stock ?? 10) > 0);
      }
      const total = count ?? normalized.length;
      return {
        products: normalized,
        totalCount: total,
        page: currentPage,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
      };
    }

    console.error("Supabase getShopCatalog error:", error);
    return {
      products: [],
      totalCount: 0,
      page: currentPage,
      pageSize,
      totalPages: 1,
    };
  } catch (err) {
    console.error("Exception in getShopCatalog:", err);
    return {
      products: [],
      totalCount: 0,
      page: 1,
      pageSize,
      totalPages: 1,
    };
  }
}

// Fetch hot deals products
export async function getDealProducts() {
  return getAllProducts();
}

// Fetch products by category slug
export async function getProductsByCategory(categorySlug: string) {
  try {
    const cleanSlug = categorySlug.trim().toLowerCase();
    const targetCatIds = await resolveCategoryIds(categorySlug);
    if (targetCatIds.length === 0) {
      return [];
    }

    const prodQuery = supabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        description,
        is_active,
        min_price_cents,
        max_price_cents,
        brand:brands ( id, name, slug, logo_url ),
        category:categories!inner ( id, name, slug, description ),
        variants:product_variants (
          id,
          sku,
          name,
          price_cents,
          compare_at_price_cents,
          is_serialized,
          weight_grams,
          dimensions_mm_l_w_h,
          images:product_images ( id, image_url, sort_order, is_featured ),
          specifications:product_specifications ( specs ),
          inventory:warehouse_inventory ( quantity_on_hand, quantity_reserved )
        )
      `)
      .eq("is_active", true)
      .in("category_id", targetCatIds);

    const { data, error } = await prodQuery.order("id", { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map(normalizeProduct);
    }
    const all = await getAllProducts();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return all.filter((p: any) =>
      (p.category || "").toLowerCase().includes(cleanSlug)
    );
  } catch {
    const all = await getAllProducts();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return all.filter((p: any) =>
      (p.category || "").toLowerCase().includes(categorySlug.toLowerCase())
    );
  }
}
