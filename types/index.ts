export type StockStatus = "in_stock" | "out_of_stock" | "low_stock";

export interface ProductImage {
  id?: string | number;
  variant_id?: string | number;
  image_url: string;
  sort_order?: number;
  is_featured?: boolean;
  created_at?: string;
}

export interface ProductSpecification {
  id?: string | number;
  variant_id?: string | number;
  specs: Record<string, string | number | boolean>;
  created_at?: string;
  updated_at?: string;
}

export interface WarehouseInventory {
  id?: string | number;
  warehouse_id?: string | number;
  variant_id?: string | number;
  quantity_on_hand: number;
  quantity_reserved?: number;
}

export interface ProductVariant {
  id: string | number;
  product_id?: string | number;
  sku: string;
  upc?: string | null;
  name: string;
  price_cents: number;
  compare_at_price_cents?: number | null;
  cost_cents?: number | null;
  is_serialized?: boolean;
  weight_grams?: number | null;
  dimensions_mm_l_w_h?: string | null;
  created_at?: string;
  updated_at?: string;
  // UI & normalized fields
  price?: number;
  comparePrice?: number;
  stock?: number;
  isStock?: boolean;
  images?: string[];
  product_images?: ProductImage[];
  specifications?: ProductSpecification | ProductSpecification[];
  specs?: Record<string, string | number | boolean>;
  inventory?: WarehouseInventory | WarehouseInventory[];
  warehouse_inventory?: WarehouseInventory | WarehouseInventory[];
  products?: { id: string | number; name: string; slug: string };
}

export interface Product {
  id: string;
  _id?: string;
  title: string;
  name?: string;
  slug: string;
  price: number;
  discountPrice?: number;
  min_price_cents?: number;
  max_price_cents?: number;
  lowestPrice?: number;
  rating: number;
  reviewsCount: number;
  stockStatus: StockStatus;
  brand?: string | Brand | any;
  brands?: Brand;
  images: string[];
  product_images?: ProductImage[];
  description: string;
  category: string;
  categories?: Category;
  tag?: string;
  stock?: number;
  status?: string;
  productType?: string;
  isFeatured?: boolean;
  variants?: ProductVariant[];
  product_variants?: ProductVariant[];
  sku?: string;
  specs?: Record<string, string | number | boolean>;
  weight_grams?: number | null;
  dimensions_mm_l_w_h?: string | null;
}

export interface Category {
  id: string;
  _id?: string;
  title: string;
  name?: string;
  slug: string;
  icon?: string;
  productCount?: number;
  image?: string;
  description?: string;
  parent_id?: number | string | null;
  children?: Category[];
}

export interface Brand {
  id: string;
  _id?: string;
  title: string;
  name?: string;
  slug: string;
  image?: string;
  logo?: string;
  logo_url?: string;
  description?: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  publishedAt: string;
  mainImage?: string;
  isLatest?: boolean;
  categories?: string[];
}

export interface NavigationItem {
  title: string;
  href: string;
  badge?: string;
}

export interface CartItem {
  id?: string | number;
  cart_id?: string | number;
  variant_id: string | number;
  quantity: number;
  variant?: ProductVariant;
  // Client state & compatibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product?: any;
}

export interface Address {
  id: string | number;
  customer_id?: string | number;
  label?: string | null;
  recipient_name?: string | null;
  phone?: string | null;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country?: string | null;
  is_default?: boolean;
  // Field aliases for compatibility
  name?: string;
  type?: string;
  pincode?: string;
  addressLine1?: string;
  addressLine2?: string;
}

export interface OrderItem {
  id?: string | number;
  order_id?: string | number;
  variant_id: string | number;
  quantity: number;
  unit_price_cents: number;
  total_price_cents?: number;
  tax_amount_cents?: number;
  discount_amount_cents?: number;
  warranty_months?: number;
  warranty_price_cents?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product_variants?: ProductVariant | ProductVariant[] | any;
}

export interface Order {
  id: string | number;
  customer_id?: string | number;
  order_number: string;
  status: string;
  payment_status: string;
  subtotal_amount_cents?: number;
  tax_amount_cents?: number;
  tax_cents?: number;
  shipping_amount_cents?: number;
  shipping_cents?: number;
  discount_amount_cents?: number;
  discount_cents?: number;
  total_amount_cents?: number;
  total_cents?: number;
  shipping_address_snapshot?: Address | Record<string, unknown> | null;
  billing_address_snapshot?: Address | Record<string, unknown> | null;
  shipping_address?: Address | Record<string, unknown> | null;
  billing_address?: Address | Record<string, unknown> | null;
  carrier?: string | null;
  tracking_number?: string | null;
  created_at: string;
  items?: OrderItem[];
  order_items?: OrderItem[];
}
