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
  icon: string;
}

export interface NavigationItem {
  title: string;
  href: string;
  badge?: string;
}
