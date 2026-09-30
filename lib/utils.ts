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

/**
 * Redacts email addresses for safe logging and diagnostics:
 * e.g., "customer@example.com" -> "c***@example.com"
 */
export function redactEmail(email?: string | null): string {
  if (!email || !email.includes("@")) return "[REDACTED_EMAIL]";
  const [localPart, domain] = email.split("@");
  if (!localPart || localPart.length <= 1) return `*@${domain}`;
  return `${localPart[0]}***@${domain}`;
}

/**
 * Redacts phone numbers for safe logging:
 * e.g., "+919876543210" -> "******3210"
 */
export function redactPhone(phone?: string | null): string {
  if (!phone) return "[REDACTED_PHONE]";
  const clean = phone.replace(/\D/g, "");
  if (clean.length < 4) return "******";
  return `******${clean.slice(-4)}`;
}

/**
 * Redacts shipping destination addresses for safe logging:
 */
export function redactAddress(): string {
  return "[REDACTED_SHIPPING_DESTINATION]";
}
