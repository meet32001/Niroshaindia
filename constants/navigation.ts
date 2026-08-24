import { NavigationItem, Category } from "@/types";

export const CATEGORIES: Category[] = [
  {
    id: "cat-1",
    title: "Audio & Headphones",
    slug: "audio-headphones",
    icon: "Headphones",
  },
  {
    id: "cat-2",
    title: "Smartphones & Tablets",
    slug: "smartphones-tablets",
    icon: "Smartphone",
  },
  {
    id: "cat-3",
    title: "Laptops & Workstations",
    slug: "laptops-workstations",
    icon: "Laptop",
  },
  {
    id: "cat-4",
    title: "Smart Wearables",
    slug: "smart-wearables",
    icon: "Watch",
  },
  {
    id: "cat-5",
    title: "Gaming & Accessories",
    slug: "gaming-accessories",
    icon: "Gamepad2",
  },
];

export const MAIN_NAV_ITEMS: NavigationItem[] = [
  { title: "Home", href: "/" },
  { title: "Audio & Wireless", href: "/category/audio-headphones" },
  { title: "Smartphones", href: "/category/smartphones-tablets" },
  { title: "Laptops", href: "/category/laptops-workstations" },
  { title: "Special Deals", href: "/deals", badge: "HOT" },
];

export const CUSTOMER_CARE_LINKS: NavigationItem[] = [
  { title: "Order Tracking", href: "/account/orders" },
  { title: "Warranty Policy", href: "/warranty" },
  { title: "Returns & Refunds", href: "/returns" },
  { title: "Shipping & Delivery", href: "/shipping" },
  { title: "Support Center", href: "/support" },
];

export const LEGAL_LINKS: NavigationItem[] = [
  { title: "Privacy Policy", href: "/privacy" },
  { title: "Terms of Service", href: "/terms" },
  { title: "Sitemap", href: "/sitemap.xml" },
];
