import { supabase } from "@/lib/supabase/client";
import { supabaseServer } from "@/lib/supabase/server";
import { Product, Category, Brand } from "@/types";

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

  const brandObj = item.brands || item.brand;
  const brandName = typeof brandObj === "string" ? brandObj : brandObj?.name || brandObj?.title || "Brand";

  const catObj = item.categories || item.category;
  const categoryName = typeof catObj === "string" ? catObj : catObj?.name || catObj?.title || "Electronics";

  const variants = item.product_variants || item.variants || [];
  const primaryVariant = variants[0] || {};

  const priceCents = primaryVariant.price_cents ?? item.price_cents ?? (item.price ? item.price * 100 : 0);
  const comparePriceCents = primaryVariant.compare_at_price_cents ?? item.compare_at_price_cents ?? (item.discountPrice ? item.discountPrice * 100 : 0);

  const price = priceCents ? priceCents / 100 : item.price || 0;
  const discountPrice = comparePriceCents ? comparePriceCents / 100 : item.discountPrice || item.discount || 0;

  let images: string[] = [];
  if (primaryVariant.product_images && Array.isArray(primaryVariant.product_images)) {
    images = primaryVariant.product_images
      .map((img: { image_url?: string; url?: string }) => img.image_url || img.url)
      .filter(Boolean);
  } else if (item.product_images && Array.isArray(item.product_images)) {
    images = item.product_images
      .map((img: { image_url?: string; url?: string }) => img.image_url || img.url)
      .filter(Boolean);
  } else if (Array.isArray(item.images)) {
    images = item.images;
  }

  if (images.length === 0) {
    images = [defaultFallbackImg];
  }

  const specs =
    primaryVariant.product_specifications?.specs ||
    (Array.isArray(primaryVariant.product_specifications)
      ? primaryVariant.product_specifications[0]?.specs
      : item.specs) ||
    {};

  return {
    ...item,
    id: item.id || item._id,
    title: item.name || item.title || "Electronics Product",
    name: item.name || item.title || "Electronics Product",
    slug: typeof item.slug === "string" ? item.slug : item.slug?.current || "product",
    brand: brandName,
    brands: typeof brandObj === "object" ? brandObj : { name: brandName },
    category: categoryName,
    categories: typeof catObj === "object" ? catObj : { name: categoryName },
    price,
    discountPrice,
    images,
    product_variants: variants,
    specs,
  };
}

// Fetch all active products matching PostgREST relational schema
export async function getAllProducts() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        description,
        is_active,
        brands:brand_id ( id, name, slug, logo_url ),
        categories:category_id ( id, name, slug, description ),
        product_variants (
          id,
          sku,
          name,
          price_cents,
          compare_at_price_cents,
          is_serialized,
          weight_grams,
          product_images ( id, image_url, sort_order, is_featured ),
          product_specifications ( specs )
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
        brands:brand_id ( id, name, slug, logo_url ),
        categories:category_id ( id, name, slug, description ),
        product_variants (
          id,
          sku,
          name,
          price_cents,
          compare_at_price_cents,
          is_serialized,
          weight_grams,
          product_images ( id, image_url, sort_order, is_featured ),
          product_specifications ( specs )
        )
      `)
      .eq("slug", slug)
      .single();

    if (!error && data) {
      return normalizeProduct(data);
    }

    const match = MOCK_PRODUCTS.find((p) => p.slug === slug);
    return normalizeProduct(match || MOCK_PRODUCTS[0]);
  } catch {
    const match = MOCK_PRODUCTS.find((p) => p.slug === slug);
    return normalizeProduct(match || MOCK_PRODUCTS[0]);
  }
}

// Fetch categories matching PostgREST schema
export async function getCategories(quantity?: number) {
  try {
    const query = supabase
      .from("categories")
      .select("id, name, slug, description, image_url")
      .order("name", { ascending: true });

    if (quantity) {
      query.limit(quantity);
    }
    const { data, error } = await query;
    if (!error && Array.isArray(data) && data.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.map((cat: any) => ({
        ...cat,
        title: cat.name || cat.title,
        image: cat.image_url || cat.image,
      }));
    }
    return quantity ? MOCK_CATEGORIES.slice(0, quantity) : MOCK_CATEGORIES;
  } catch {
    return quantity ? MOCK_CATEGORIES.slice(0, quantity) : MOCK_CATEGORIES;
  }
}

// Fetch brands matching PostgREST schema
export async function getBrands() {
  try {
    const { data, error } = await supabase
      .from("brands")
      .select("id, name, slug, logo_url")
      .order("name", { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.map((b: any) => ({
        ...b,
        title: b.name || b.title,
        image: b.logo_url || b.image,
      }));
    }
    return MOCK_BRANDS;
  } catch {
    return MOCK_BRANDS;
  }
}

export const getAllBrands = getBrands;

// Fetch hot deals products
export async function getDealProducts() {
  return getAllProducts();
}

// Fetch products by category slug
export async function getProductsByCategory(categorySlug: string) {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        description,
        is_active,
        brands:brand_id ( id, name, slug, logo_url ),
        categories:category_id!inner ( id, name, slug, description ),
        product_variants (
          id,
          sku,
          name,
          price_cents,
          compare_at_price_cents,
          is_serialized,
          weight_grams,
          product_images ( id, image_url, sort_order, is_featured ),
          product_specifications ( specs )
        )
      `)
      .eq("categories.slug", categorySlug)
      .eq("is_active", true);

    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map(normalizeProduct);
    }
    const all = await getAllProducts();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return all.filter((p: any) =>
      (p.category || "").toLowerCase().includes(categorySlug.toLowerCase())
    );
  } catch {
    const all = await getAllProducts();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return all.filter((p: any) =>
      (p.category || "").toLowerCase().includes(categorySlug.toLowerCase())
    );
  }
}

// Fetch user orders by Clerk UserId via customers table join
export async function getMyOrders(userId: string) {
  try {
    if (!userId) return [];

    const { data: customer, error: custErr } = await supabaseServer
      .from("customers")
      .select("id")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (custErr || !customer) {
      // Fallback query directly on orders table if customer record is pending
      const { data: directOrders } = await supabaseServer
        .from("orders")
        .select("*")
        .eq("clerk_user_id", userId)
        .order("created_at", { ascending: false });

      return directOrders || [];
    }

    const { data, error } = await supabaseServer
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          product_variants (
            name,
            sku,
            product_images ( image_url )
          )
        )
      `)
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching user orders from Supabase:", error);
    return [];
  }
}
