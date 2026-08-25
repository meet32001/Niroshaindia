export type StockStatus = "in_stock" | "out_of_stock" | "low_stock";

export interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  discountPrice?: number;
  rating: number;
  reviewsCount: number;
  stockStatus: StockStatus;
  brand: string;
  images: string[];
  description: string;
  category: string;
  tag?: string;
}

export interface Category {
  id: string;
  title: string;
  slug: string;
  icon?: string;
  productCount?: number;
  image?: string;
}

export interface Brand {
  id: string;
  title: string;
  slug: string;
  image?: string;
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
