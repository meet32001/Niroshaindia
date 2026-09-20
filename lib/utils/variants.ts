/**
 * Variant attribute extraction and color/storage resolution utilities.
 */

export interface ParsedVariantOption {
  variantId: number | string;
  sku: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  name: string;
  attributes: {
    color?: string;
    storage?: string;
    [key: string]: string | undefined;
  };
}

/**
 * Extracts selectable attributes (Color, Storage, etc.) from variant name and specifications.
 * Supports patterns like:
 * - "Apple iPhone Duo (256GB Storage, Star White)"
 * - "Apple iPhone Duo (1TB Storage, Night Sky)"
 * - "256GB / Space Gray"
 * - "128 GB, Natural Titanium"
 */
export function parseVariantAttributes(
  variantName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  specs?: Record<string, any>
): { color?: string; storage?: string; [key: string]: string | undefined } {
  // 1. Storage extraction
  let storage: string | undefined;
  const storageMatch = variantName.match(/(\d+\s?(?:GB|TB|MB))/i);
  if (storageMatch) {
    storage = storageMatch[1].replace(/\s+/g, "").toUpperCase();
  } else if (specs?.storage && typeof specs.storage === "string") {
    const specStorageMatch = specs.storage.match(/(\d+\s?(?:GB|TB|MB))/i);
    if (specStorageMatch) {
      storage = specStorageMatch[1].replace(/\s+/g, "").toUpperCase();
    }
  }

  // 2. Color extraction
  let color: string | undefined;
  const colorMatch = variantName.match(/(?:Storage,\s*|[\/\-,]\s*)([A-Za-z\s]+)(?:\)|$)/);
  if (colorMatch) {
    color = colorMatch[1].replace(/[\(\)]/g, "").trim();
  } else if (specs?.color && typeof specs.color === "string") {
    color = specs.color.trim();
  }

  return {
    storage,
    color,
  };
}

/**
 * Convert storage string (e.g. "256GB", "1TB", "512GB") to numeric gigabytes for ascending sort.
 */
export function getStorageInGB(storage: string): number {
  const match = storage.match(/(\d+)\s*(GB|TB|MB)/i);
  if (!match) return 0;
  const val = parseInt(match[1], 10);
  const unit = match[2].toUpperCase();
  if (unit === "TB") return val * 1024;
  if (unit === "MB") return val / 1024;
  return val;
}

/**
 * Color metadata for visual swatches and indicators.
 */
export interface ColorSwatchMeta {
  bg: string;
  border?: string;
  isLight?: boolean;
}

export function getColorSwatch(colorName?: string): ColorSwatchMeta {
  if (!colorName) return { bg: "#94a3b8", border: "#64748b" };
  const lower = colorName.toLowerCase().trim();

  if (lower.includes("star white") || lower.includes("white") || lower.includes("starlight")) {
    return { bg: "#F8FAFC", border: "#CBD5E1", isLight: true };
  }
  if (lower.includes("night sky") || lower.includes("midnight") || lower.includes("space black") || lower.includes("black")) {
    return { bg: "#0F172A", border: "#334155", isLight: false };
  }
  if (lower.includes("space gray") || lower.includes("graphite") || lower.includes("charcoal")) {
    return { bg: "#374151", border: "#4B5563", isLight: false };
  }
  if (lower.includes("natural titanium") || lower.includes("titanium")) {
    return { bg: "#9E9893", border: "#B5AFA9", isLight: false };
  }
  if (lower.includes("silver") || lower.includes("platinum")) {
    return { bg: "#E2E8F0", border: "#CBD5E1", isLight: true };
  }
  if (lower.includes("gold") || lower.includes("champagne")) {
    return { bg: "#FDE047", border: "#EAB308", isLight: true };
  }
  if (lower.includes("rose gold") || lower.includes("pink")) {
    return { bg: "#F472B6", border: "#EC4899", isLight: true };
  }
  if (lower.includes("blue") || lower.includes("pacific blue") || lower.includes("sierra blue")) {
    return { bg: "#2563EB", border: "#1D4ED8", isLight: false };
  }
  if (lower.includes("green") || lower.includes("alpine green") || lower.includes("emerald")) {
    return { bg: "#16A34A", border: "#15803D", isLight: false };
  }
  if (lower.includes("red") || lower.includes("product red")) {
    return { bg: "#DC2626", border: "#B91C1C", isLight: false };
  }
  if (lower.includes("purple") || lower.includes("deep purple")) {
    return { bg: "#7E22CE", border: "#6B21A8", isLight: false };
  }
  if (lower.includes("yellow")) {
    return { bg: "#EAB308", border: "#CA8A04", isLight: true };
  }

  return { bg: "#64748B", border: "#475569", isLight: false };
}
