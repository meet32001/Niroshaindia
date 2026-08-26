export type StockStatus = "in_stock" | "out_of_stock" | "low_stock";

export interface Product {
  id: string;
  _id?: string;
  title: string;
  name?: string;
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
  stock?: number;
  status?: string;
  productType?: string;
  isFeatured?: boolean;
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
}

export interface Brand {
  id: string;
  _id?: string;
  title: string;
  name?: string;
  slug: string;
  image?: string;
  logo?: string;
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
