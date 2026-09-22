/**
 * Variant attribute extraction and multi-variant resolution utilities.
 * Handles phones, tablets, laptops, TVs, home appliances, heating gear, and security lockers.
 */

export interface ParsedAttributes {
  color?: string;
  storage?: string;
  ram?: string;
  displaySize?: string;
  capacityOrTon?: string;
  fins?: string;
  lockType?: string;
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
 * home appliances, laptops, audio, heating gear, and security lockers.
 */
export function parseVariantName(name: string): ParsedAttributes {
  // 1. Fin Count for Oil Filled Radiators (e.g. 9 Fins, 11 Fins, 13 Fins, 15 Fins, 9F, 11F, 4209 F, 4309 FSE)
  let fins: string | undefined;
  const modelFinMatch = name.match(/\b\d{2}(09|11|13|15)\s*F(?:SE)?\b/i);
  if (modelFinMatch) {
    fins = `${parseInt(modelFinMatch[1], 10)} Fins`;
  } else {
    const finMatch = name.match(/\b(\d{1,2})\s*(?:-?\s*M?-?\s*Fins?|F\b)/i);
    if (finMatch) {
      fins = `${finMatch[1]} Fins`;
    }
  }

  // 2. Safe Locking Mechanism (Key Lock, Digital Keypad, Biometric & PIN, Dual Lock)
  let lockType: string | undefined;
  if (/biometric|fingerprint|digi\s*\+\s*bio|\bbio\s+nx\b|smart\s*door\s*lock/i.test(name)) {
    lockType = "Biometric & PIN";
  } else if (/\b(?:el\+kl|dual\s*lock)\b/i.test(name)) {
    lockType = "Dual Lock";
  } else if (/\b(?:digital\s*(?:safe|locker|home|lock|locking|keypad|nx)|electronic\s*(?:safe|locker|home|lock)|with\s*digital\s*locking)\b/i.test(name)) {
    lockType = "Digital Keypad";
  } else if (/\b(?:key\s*lock|keylock|mechanical(?:\s*key|\s*override|\s*home\s*safe)?|6\s*lever\s*lock)\b/i.test(name) && /safe|locker|lock\b/i.test(name)) {
    lockType = "Key Lock";
  }

  // 3. Appliance Capacity / Volume (e.g. 7 Kg, 8.5 Kg, 12 Kg, 50L, 78 Litres, 112L, 1.5 Ton)
  const capacityMatch = name.match(/(\d+(?:\.\d+)?)\s*(Kg|Litres|Ltr|L\b|Tons?)/i);
  let capacityOrTon: string | undefined;
  if (capacityMatch) {
    const val = capacityMatch[1];
    let unit = capacityMatch[2].toUpperCase();
    if (unit === "LITRES" || unit === "LTR") unit = "L";
    if (unit === "TONS") unit = "Ton";
    if (unit === "KG") unit = "Kg";
    capacityOrTon = `${val} ${unit}`;
  }

  // 4. Display Size (e.g. 11 Inch, 13 Inch, 55 Inch, 65 Inch, 55", 65")
  const displayMatch = name.match(/(\d+(?:\.\d+)?\s*(?:Inch|cm|"))/i);

  // 5. RAM (e.g. 8GB RAM, 12GB RAM, 16GB RAM)
  const ramMatch = name.match(/(\d+\s*GB\s*RAM)/i);

  // 6. Storage (e.g. 128GB, 256GB, 512GB, 1TB, 2TB) - prioritizes explicit storage/SSD/ROM
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

  // 7. Special Glass / Tech Finish
  const glassMatch = name.match(/(Nano-texture Glass|Standard Glass|OLED evo|Super AMOLED)/i);

  // 8. Color extraction (Matches known colors, pipe segments, or parenthesized segments)
  let color: string | undefined;
  const knownColors = [
    "Natural Titanium", "Black Titanium", "White Titanium", "Desert Titanium",
    "Night Sky", "Star White", "Space Gray", "Space Grey", "Space Black", "Charcoal Black", "Charcoal",
    "Glacier White", "Aurora Blue", "Twilight Blue", "Mint Breeze", "Electric Violet",
    "Silver", "Gold", "Rose Gold", "Midnight", "Starlight", "Dark Jade Silver",
    "Shiny Steel", "Stainless Steel", "Inox", "White", "Black", "Blue", "Green", "Red",
    "Purple", "Yellow", "Pink", "Indigo", "Platinum", "Grey", "Gray", "Navy", "Navy Blue",
    "Onyx Black", "Middle Black", "Dark Grey", "Platinum Silver", "Burgundy",
    "Graphite Grey", "Mocha", "Coffee Brown", "Brown"
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
    fins,
    lockType,
    capacityOrTon,
    displaySize: displayMatch ? displayMatch[1].trim() : undefined,
    ram: ramMatch ? ramMatch[1].trim() : undefined,
    storage: storage || undefined,
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
  if (!parsed.capacityOrTon && (specs?.capacity || specs?.tonnage || specs?.volume)) {
    parsed.capacityOrTon = String(specs.capacity || specs.tonnage || specs.volume).trim();
  }
  if (!parsed.fins && specs?.fins) {
    parsed.fins = `${specs.fins} Fins`;
  }
  if (!parsed.lockType && specs?.lock_type) {
    parsed.lockType = String(specs.lock_type).trim();
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
    lower.includes("onyx black") ||
    lower.includes("middle black") ||
    lower.includes("night sky") ||
    lower.includes("midnight") ||
    lower.includes("space black") ||
    lower.includes("charcoal black") ||
    lower.includes("black")
  ) {
    return { bg: "#0F172A", border: "#334155", isLight: false };
  }
  if (
    lower.includes("dark grey") ||
    lower.includes("dark gray") ||
    lower.includes("graphite grey") ||
    lower.includes("graphite gray")
  ) {
    return { bg: "#3F3F46", border: "#52525B", isLight: false };
  }
  if (
    lower.includes("space gray") ||
    lower.includes("space grey") ||
    lower.includes("graphite") ||
    lower.includes("charcoal")
  ) {
    return { bg: "#374151", border: "#4B5563", isLight: false };
  }
  if (lower.includes("natural titanium") || lower.includes("titanium")) {
    return { bg: "#9E9893", border: "#B5AFA9", isLight: false };
  }
  if (
    lower.includes("platinum silver") ||
    lower.includes("silver") ||
    lower.includes("platinum") ||
    lower.includes("dark jade silver") ||
    lower.includes("shiny steel") ||
    lower.includes("stainless steel") ||
    lower.includes("inox")
  ) {
    return { bg: "#E2E8F0", border: "#CBD5E1", isLight: true };
  }
  if (lower.includes("coffee brown") || lower.includes("brown") || lower.includes("mocha")) {
    return { bg: "#5C4033", border: "#3D2B1F", isLight: false };
  }
  if (lower.includes("burgundy")) {
    return { bg: "#800020", border: "#580016", isLight: false };
  }
  if (lower.includes("gold") || lower.includes("champagne") || lower.includes("desert titanium")) {
    return { bg: "#FDE047", border: "#EAB308", isLight: true };
  }
  if (lower.includes("rose gold") || lower.includes("pink")) {
    return { bg: "#F472B6", border: "#EC4899", isLight: true };
  }
  if (
    lower.includes("navy") ||
    lower.includes("aurora blue") ||
    lower.includes("twilight blue") ||
    lower.includes("blue") ||
    lower.includes("pacific blue") ||
    lower.includes("sierra blue") ||
    lower.includes("indigo")
  ) {
    return { bg: "#1E3A8A", border: "#172554", isLight: false };
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
