import { NavigationItem, Category } from "@/types";
import { LucideIcon, Video, Globe, Share2, MessageSquare } from "lucide-react";

export interface SocialLink {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const HEADER_NAV_LINKS: NavigationItem[] = [
  { title: "Home", href: "/" },
  { title: "Shop", href: "/shop" },
  { title: "Deals", href: "/deals", badge: "HOT" },
  { title: "Blog", href: "/blog" },
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
