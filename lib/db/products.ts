import { supabase } from "@/lib/supabase/client";
import { Product, Category, Brand } from "@/types";

export const MOCK_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    title: "Gadgets & Accessories",
    slug: "gadgets",
    icon: "Headphones",
    productCount: 12,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "cat-2",
    title: "Smart Appliances",
    slug: "appliances",
    icon: "Tv",
    productCount: 8,
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "cat-3",
    title: "Refrigerators",
    slug: "refrigerators",
    icon: "Refrigerator",
    productCount: 6,
    image: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "cat-4",
    title: "Other Electronics",
    slug: "others",
    icon: "Cpu",
    productCount: 15,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
  },
];

export const MOCK_BRANDS: Brand[] = [
  { id: "b-1", title: "Apple", slug: "apple", image: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
  { id: "b-2", title: "Sony", slug: "sony", image: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg" },
  { id: "b-3", title: "Dell", slug: "dell", image: "https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_2016.svg" },
  { id: "b-4", title: "HP", slug: "hp", image: "https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg" },
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

// Fetch all active products
export async function getAllProducts() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        categories (title, slug),
        brands (name, title, slug),
        variants (*),
        product_images (url)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.map((item: any) => ({
        ...item,
        name: item.name || item.title,
        title: item.title || item.name,
        price: item.price_cents ? item.price_cents / 100 : item.price || 0,
        discount: item.compare_at_price_cents ? item.compare_at_price_cents / 100 : item.discount || 0,
        images: item.product_images?.map((i: { url: string }) => i.url) || item.images || [],
      }));
    }
    return MOCK_PRODUCTS;
  } catch {
    return MOCK_PRODUCTS;
  }
}

// Fetch single detailed product by slug
export async function getProductBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        categories (title, slug),
        brands (name, title, slug),
        variants (*),
        product_images (url)
      `)
      .eq("slug", slug)
      .single();

    if (!error && data) {
      return {
        ...data,
        name: data.name || data.title,
        title: data.title || data.name,
        price: data.price_cents ? data.price_cents / 100 : data.price || 0,
        discount: data.compare_at_price_cents ? data.compare_at_price_cents / 100 : data.discount || 0,
        images: data.product_images?.map((i: { url: string }) => i.url) || data.images || [],
      };
    }

    const match = MOCK_PRODUCTS.find((p) => p.slug === slug);
    return match || MOCK_PRODUCTS[0];
  } catch {
    const match = MOCK_PRODUCTS.find((p) => p.slug === slug);
    return match || MOCK_PRODUCTS[0];
  }
}

// Fetch categories
export async function getCategories(quantity?: number) {
  try {
    const query = supabase.from("categories").select("*").order("title", { ascending: true });
    if (quantity) {
      query.limit(quantity);
    }
    const { data, error } = await query;
    if (!error && Array.isArray(data) && data.length > 0) {
      return data;
    }
    return quantity ? MOCK_CATEGORIES.slice(0, quantity) : MOCK_CATEGORIES;
  } catch {
    return quantity ? MOCK_CATEGORIES.slice(0, quantity) : MOCK_CATEGORIES;
  }
}

// Fetch brands
export async function getBrands() {
  try {
    const { data, error } = await supabase.from("brands").select("*").order("name", { ascending: true });
    if (!error && Array.isArray(data) && data.length > 0) {
      return data;
    }
    return MOCK_BRANDS;
  } catch {
    return MOCK_BRANDS;
  }
}

// Alias for getBrands matching components import
export const getAllBrands = getBrands;

// Fetch hot deals products
export async function getDealProducts() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .or("status.eq.hot,is_featured.eq.true");

    if (!error && Array.isArray(data) && data.length > 0) {
      return data;
    }
    return MOCK_PRODUCTS;
  } catch {
    return MOCK_PRODUCTS;
  }
}

// Fetch products by category
export async function getProductsByCategory(categorySlug: string) {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, categories!inner(slug)")
      .eq("categories.slug", categorySlug);

    if (!error && Array.isArray(data) && data.length > 0) {
      return data;
    }
    return MOCK_PRODUCTS.filter((p) =>
      p.category.toLowerCase().includes(categorySlug.toLowerCase())
    );
  } catch {
    return MOCK_PRODUCTS.filter((p) =>
      p.category.toLowerCase().includes(categorySlug.toLowerCase())
    );
  }
}

// Fetch user orders by Clerk UserId
export async function getMyOrders(userId: string) {
  try {
    if (!userId) return [];
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("clerk_user_id", userId)
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
