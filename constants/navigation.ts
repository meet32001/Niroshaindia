import { NavigationItem, Category } from "@/types";
import { LucideIcon, Video, Globe, Share2, MessageSquare } from "lucide-react";

export interface SocialLink {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const PRODUCT_TYPES = [
  { title: "All Products", value: "all" },
  { title: "Smartphones", value: "smartphones" },
  { title: "Air Conditioners", value: "air-conditioners" },
  { title: "Tablets & iPads", value: "tablets-ipads" },
  { title: "Accessories", value: "accessories" },
];

export interface PreviewTab {
  id: string;
  label: string;
  icon: string;
  categorySlugs: string[];
  title?: string;
  value?: string;
  iconName?: string;
}

export const PREVIEW_TABS: PreviewTab[] = [
  {
    id: "all",
    label: "All Products",
    icon: "Sparkles",
    categorySlugs: [], // Fetches balanced featured items across catalog
    title: "All Products",
    value: "all",
    iconName: "Sparkles",
  },
  {
    id: "ac",
    label: "Air Conditioners",
    icon: "AirVent",
    // Strictly air conditioners only
    categorySlugs: ["air-conditioners", "split-air-conditioners", "window-air-conditioners"],
    title: "Air Conditioners",
    value: "ac",
    iconName: "AirVent",
  },
  {
    id: "mobiles-tablets",
    label: "Mobiles & Tablets",
    icon: "Smartphone",
    // Strictly phones and tablets - EXCLUDES chargers, cases, smartwatches
    categorySlugs: ["smartphones", "tablets-ipads"],
    title: "Mobiles & Tablets",
    value: "mobiles-tablets",
    iconName: "Smartphone",
  },
  {
    id: "laptops-pcs",
    label: "Laptops & MacBooks",
    icon: "Laptop",
    // Strictly computers - EXCLUDES laptop bags, cables, external storage
    categorySlugs: [
      "laptops-macbooks",
      "gaming-laptops",
      "laptops-ultrabooks",
      "laptops",
      "monitors-desktops",
    ],
    title: "Laptops & MacBooks",
    value: "laptops-pcs",
    iconName: "Laptop",
  },
  {
    id: "tv-vision",
    label: "TV & Vision",
    icon: "Tv",
    // Strictly TVs
    categorySlugs: ["4k-oled-smart-tvs", "4k-smart-tvs", "televisions"],
    title: "TV & Vision",
    value: "tv-vision",
    iconName: "Tv",
  },
  {
    id: "audio-headphones",
    label: "Audio & Headphones",
    icon: "Headphones",
    // Strictly audio items - EXCLUDES tablets, phones, smartwatches
    categorySlugs: [
      "tws-earbuds",
      "headphones",
      "bluetooth-speakers",
      "soundbars-home-theatres",
      "party-speakers",
      "headphones-tws",
    ],
    title: "Audio & Headphones",
    value: "audio-headphones",
    iconName: "Headphones",
  },
  {
    id: "home-appliances",
    label: "Home Appliances",
    icon: "Home",
    categorySlugs: ["refrigerators", "washing-machines", "air-conditioners"],
    title: "Home Appliances",
    value: "home-appliances",
    iconName: "Home",
  },
  {
    id: "kitchen-appliances",
    label: "Kitchen Appliances",
    icon: "UtensilsCrossed",
    categorySlugs: ["microwaves-otgs", "mixers-juicers-blenders", "air-fryers"],
    title: "Kitchen Appliances",
    value: "kitchen-appliances",
    iconName: "UtensilsCrossed",
  },
];

export const VIJAY_SALES_CATEGORIES = PREVIEW_TABS;


export const HEADER_NAV_LINKS: NavigationItem[] = [
  { title: "Home", href: "/" },
  { title: "Shop", href: "/shop" },
  { title: "Deals", href: "/deal" },
  { title: "Contact", href: "/contact" },
];

export const SOCIAL_LINKS: SocialLink[] = [
  {
    title: "YouTube",
    href: "https://youtube.com",
    icon: Video,
  },
  {
    title: "GitHub",
    href: "https://github.com",
    icon: Globe,
  },
  {
    title: "LinkedIn",
    href: "https://linkedin.com",
    icon: Share2,
  },
  {
    title: "Facebook",
    href: "https://facebook.com",
    icon: MessageSquare,
  },
];

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

export const CUSTOMER_CARE_LINKS: NavigationItem[] = [
  { title: "Order Tracking", href: "/orders" },
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
