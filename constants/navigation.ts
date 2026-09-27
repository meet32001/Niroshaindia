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
    categorySlugs: [
      "refrigerators",
      "washing-machines",
      "air-conditioners",
      "room-heaters",
      "safes-lockers",
      "water-dispensers",
      "voltage-stabilizers",
      "cleaning-tools",
    ],
    title: "Home Appliances",
    value: "home-appliances",
    iconName: "Home",
  },
  {
    id: "kitchen-appliances",
    label: "Kitchen Appliances",
    icon: "UtensilsCrossed",
    categorySlugs: [
      "air-fryers-deep-fryers",
      "air-fryers",
      "electric-kettles-coffee-makers",
      "kettles-coffee-makers",
      "induction-cooktops-stoves",
      "cooktops-stoves",
      "kitchen-chimneys",
      "microwaves-otgs",
      "mixer-grinders-juicers-blenders",
      "mixers-juicers-blenders",
      "toasters-sandwich-makers",
      "water-purifiers",
    ],
    title: "Kitchen Appliances",
    value: "kitchen-appliances",
    iconName: "UtensilsCrossed",
  },
];

export const VIJAY_SALES_CATEGORIES = PREVIEW_TABS;

export interface NavCategoryItem {
  name: string;
  slug: string;
  href?: string;
  parentId?: number;
}

export const HOME_APPLIANCE_SUBCATEGORIES: NavCategoryItem[] = [
  { name: "Air Purifiers", slug: "air-purifiers", href: "/category/air-purifiers" },
  { name: "Cleaning Tools", slug: "cleaning-tools", href: "/category/cleaning-tools" },
  { name: "Dishwashers", slug: "dishwashers", href: "/category/dishwashers" },
  { name: "Room Heaters", slug: "room-heaters", href: "/category/room-heaters" },
  { name: "Safes & Security Lockers", slug: "safes-lockers", href: "/category/safes-lockers" },
  { name: "Vacuum Cleaners", slug: "vacuum-cleaners", href: "/category/vacuum-cleaners" },
  { name: "Voltage Stabilizers", slug: "voltage-stabilizers", href: "/category/voltage-stabilizers" },
  { name: "Washing Machines", slug: "washing-machines", href: "/category/washing-machines" },
  { name: "Water Dispensers", slug: "water-dispensers", href: "/category/water-dispensers" },
];

export const KITCHEN_APPLIANCE_SUBCATEGORIES: NavCategoryItem[] = [
  { name: "Air Fryers & Deep Fryers", slug: "air-fryers-deep-fryers", href: "/category/air-fryers-deep-fryers" },
  { name: "Electric Kettles & Coffee Makers", slug: "electric-kettles-coffee-makers", href: "/category/electric-kettles-coffee-makers" },
  { name: "Induction Cooktops & Stoves", slug: "induction-cooktops-stoves", href: "/category/induction-cooktops-stoves" },
  { name: "Kitchen Chimneys", slug: "kitchen-chimneys", href: "/category/kitchen-chimneys" },
  { name: "Microwaves & OTGs", slug: "microwaves-otgs", href: "/category/microwaves-otgs" },
  { name: "Mixer Grinders, Juicers & Blenders", slug: "mixer-grinders-juicers-blenders", href: "/category/mixer-grinders-juicers-blenders" },
  { name: "Toasters & Sandwich Makers", slug: "toasters-sandwich-makers", href: "/category/toasters-sandwich-makers" },
  { name: "Water Purifiers", slug: "water-purifiers", href: "/category/water-purifiers" },
];

export interface NavItem {
  title: string;
  href: string;
  badge?: string;
  subcategories?: NavCategoryItem[];
  categories?: {
    name: string;
    slug: string;
    href: string;
    subcategories: NavCategoryItem[];
  }[];
}

export const NAV_ITEMS: NavItem[] = [
  { title: "Home", href: "/" },
  {
    title: "Shop",
    href: "/shop",
    categories: [
      {
        name: "Home Appliances",
        slug: "home-appliances",
        href: "/category/home-appliances",
        subcategories: HOME_APPLIANCE_SUBCATEGORIES,
      },
      {
        name: "Kitchen Appliances",
        slug: "kitchen-appliances",
        href: "/category/kitchen-appliances",
        subcategories: KITCHEN_APPLIANCE_SUBCATEGORIES,
      },
    ],
  },
  { title: "Deals", href: "/deals" },
  { title: "Contact", href: "/contact" },
];

export const HEADER_NAV_LINKS: NavigationItem[] = [
  { title: "Home", href: "/" },
  { title: "Shop", href: "/shop" },
  { title: "Deals", href: "/deals" },
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
