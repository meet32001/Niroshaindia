import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeProductTitle(rawTitle: string): { title: string; warranty?: string } {
  if (!rawTitle) return { title: "Electronics Product" };
  if (!rawTitle.includes("|")) return { title: rawTitle.trim() };

  const parts = rawTitle.split("|").map((p) => p.trim()).filter(Boolean);
  const mainTitle = parts[0] || rawTitle.trim();
  const warrantyPart = parts.find((p) => p.toLowerCase().includes("warranty"));

  let formattedWarranty: string | undefined;
  if (warrantyPart) {
    const clean = warrantyPart.replace(/^warranty\s*:\s*/i, "").trim();
    formattedWarranty = clean.toLowerCase().includes("warranty") ? clean : `${clean} Warranty`;
  }

  return { title: mainTitle, warranty: formattedWarranty };
}
