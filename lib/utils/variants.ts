/**
 * Variant attribute extraction and multi-variant resolution utilities.
 * Handles phones, tablets, laptops, TVs, and home appliances dynamically.
 */

export interface ParsedAttributes {
  color?: string;
  storage?: string;
  ram?: string;
  displaySize?: string;
  capacityOrTon?: string;
  glassOrFinish?: string;
  [key: string]: string | undefined;
}

export interface StandardizedVariant {
  id: number;
  sku: string;
  name: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  attributes: ParsedAttributes;
  images: { imageUrl: string; isFeatured: boolean; sortOrder: number }[];
  inStock: boolean;
}

export interface ParsedVariantOption {
  variantId: number | string;
  sku: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  name: string;
  attributes: ParsedAttributes;
}

/**
 * Universal category-agnostic parser that automatically extracts configuration
 * pills and color options from any product variant title across consumer electronics,
 * home appliances, laptops, audio, etc.
 */
export function parseVariantName(name: string): ParsedAttributes {
  // 1. Display Size (e.g., 11 Inch, 13 Inch, 55 Inch, 65 Inch, 55", 65")
  const displayMatch = name.match(/(\d+(?:\.\d+)?\s*(?:Inch|cm|"))/i);

  // 2. RAM (e.g., 8GB RAM, 12GB RAM, 16GB RAM)
  const ramMatch = name.match(/(\d+\s*GB\s*RAM)/i);

  // 3. Storage (e.g., 128GB, 256GB, 512GB, 1TB, 2TB) - prioritizes explicit storage/SSD/ROM
  const explicitStorageMatch = name.match(/(\d+\s*(?:GB|TB))\s*(?:Storage|SSD|ROM)\b/i);
  let storage: string | undefined = explicitStorageMatch ? explicitStorageMatch[1] : undefined;
  if (!storage) {
    const genericStorageMatch = name.match(/(\d+\s*(?:GB|TB))\b(?!\s*RAM)/i);
    if (genericStorageMatch) {
      storage = genericStorageMatch[1];
    }
  }
  if (storage) {
    storage = storage.replace(/\s+/g, "").toUpperCase();
  }

  // 4. Capacity / Tonnage (e.g., 1 Ton, 1.5 Ton, 2 Ton, 4.1L, 9 Litres, 7 Kg, 11 Kg)
  const capacityMatch = name.match(/(\d+(?:\.\d+)?\s*(?:Ton|Litres|Ltr|L\b|Kg))/i);

  // 5. Special Glass / Tech Finish
  const glassMatch = name.match(/(Nano-texture Glass|Standard Glass|OLED evo|Super AMOLED)/i);

  // 6. Color extraction (Matches known colors, pipe segments, or parenthesized segments)
  let color: string | undefined;
  const knownColors = [
    "Natural Titanium", "Black Titanium", "White Titanium", "Desert Titanium",
    "Night Sky", "Star White", "Space Gray", "Space Grey", "Space Black", "Charcoal Black", "Charcoal",
    "Glacier White", "Aurora Blue", "Twilight Blue", "Mint Breeze", "Electric Violet",
    "Silver", "Gold", "Rose Gold", "Midnight", "Starlight", "Dark Jade Silver",
    "Shiny Steel", "Stainless Steel", "Inox", "White", "Black", "Blue", "Green", "Red",
    "Purple", "Yellow", "Pink", "Indigo", "Platinum", "Grey", "Gray"
  ];

  for (const kc of knownColors) {
    const reg = new RegExp(`\\b${kc}\\b`, "i");
    if (reg.test(name)) {
      color = kc;
      break;
    }
  }

  if (!color) {
    const pipeSegments = name.split("|").map((s) => s.trim());
    const lastPipeSegment = pipeSegments[pipeSegments.length - 1];
    const parenColorMatch = name.match(/(?:\(|,\s*)([A-Za-z\s]+)(?:\)|$)/);

    if (lastPipeSegment && !lastPipeSegment.match(/\d/) && lastPipeSegment.length < 25) {
      color = lastPipeSegment.replace(/[\(\)]/g, "").trim();
    } else if (parenColorMatch && !parenColorMatch[1].match(/\d/) && parenColorMatch[1].length < 25) {
      color = parenColorMatch[1].trim();
    }
  }

  // Guard against accidental collision between glass finish and color
  if (color && glassMatch && color.toLowerCase() === glassMatch[1].toLowerCase()) {
    color = undefined;
  }

  return {
    displaySize: displayMatch ? displayMatch[1].trim() : undefined,
    ram: ramMatch ? ramMatch[1].trim() : undefined,
    storage: storage || undefined,
    capacityOrTon: capacityMatch ? capacityMatch[1].trim() : undefined,
    glassOrFinish: glassMatch ? glassMatch[1].trim() : undefined,
    color: color || undefined,
  };
}

/**
 * Extracts selectable attributes from variant name and specifications.
 * Backfills missing attributes from specs dictionary if present.
 */
export function parseVariantAttributes(
  variantName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  specs?: Record<string, any>
): ParsedAttributes {
  const parsed = parseVariantName(variantName);

  if (!parsed.color && specs?.color && typeof specs.color === "string") {
    parsed.color = specs.color.trim();
  }
  if (!parsed.storage && specs?.storage && typeof specs.storage === "string") {
    const specStorage = specs.storage.match(/(\d+\s?(?:GB|TB|MB))/i);
    if (specStorage) {
      parsed.storage = specStorage[1].replace(/\s+/g, "").toUpperCase();
    }
  }
  if (!parsed.ram && specs?.ram && typeof specs.ram === "string") {
    parsed.ram = specs.ram.trim();
  }
  if (!parsed.displaySize && (specs?.screen_size || specs?.display_size)) {
    parsed.displaySize = String(specs.screen_size || specs.display_size).trim();
  }
  if (!parsed.capacityOrTon && (specs?.capacity || specs?.tonnage)) {
    parsed.capacityOrTon = String(specs.capacity || specs.tonnage).trim();
  }

  return parsed;
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

  if (
    lower.includes("star white") ||
    lower.includes("glacier white") ||
    lower.includes("white") ||
    lower.includes("starlight")
  ) {
    return { bg: "#F8FAFC", border: "#CBD5E1", isLight: true };
  }
  if (
    lower.includes("night sky") ||
    lower.includes("midnight") ||
    lower.includes("space black") ||
    lower.includes("charcoal black") ||
    lower.includes("black")
  ) {
    return { bg: "#0F172A", border: "#334155", isLight: false };
  }
  if (lower.includes("space gray") || lower.includes("space grey") || lower.includes("graphite") || lower.includes("charcoal")) {
    return { bg: "#374151", border: "#4B5563", isLight: false };
  }
  if (lower.includes("natural titanium") || lower.includes("titanium")) {
    return { bg: "#9E9893", border: "#B5AFA9", isLight: false };
  }
  if (
    lower.includes("silver") ||
    lower.includes("platinum") ||
    lower.includes("dark jade silver") ||
    lower.includes("shiny steel") ||
    lower.includes("stainless steel") ||
    lower.includes("inox")
  ) {
    return { bg: "#E2E8F0", border: "#CBD5E1", isLight: true };
  }
  if (lower.includes("gold") || lower.includes("champagne") || lower.includes("desert titanium")) {
    return { bg: "#FDE047", border: "#EAB308", isLight: true };
  }
  if (lower.includes("rose gold") || lower.includes("pink")) {
    return { bg: "#F472B6", border: "#EC4899", isLight: true };
  }
  if (
    lower.includes("aurora blue") ||
    lower.includes("twilight blue") ||
    lower.includes("blue") ||
    lower.includes("pacific blue") ||
    lower.includes("sierra blue") ||
    lower.includes("indigo")
  ) {
    return { bg: "#2563EB", border: "#1D4ED8", isLight: false };
  }
  if (
    lower.includes("green") ||
    lower.includes("alpine green") ||
    lower.includes("emerald") ||
    lower.includes("mint breeze")
  ) {
    return { bg: "#16A34A", border: "#15803D", isLight: false };
  }
  if (lower.includes("red") || lower.includes("product red")) {
    return { bg: "#DC2626", border: "#B91C1C", isLight: false };
  }
  if (
    lower.includes("purple") ||
    lower.includes("deep purple") ||
    lower.includes("electric violet")
  ) {
    return { bg: "#7E22CE", border: "#6B21A8", isLight: false };
  }
  if (lower.includes("yellow")) {
    return { bg: "#EAB308", border: "#CA8A04", isLight: true };
  }

  return { bg: "#64748B", border: "#475569", isLight: false };
}
