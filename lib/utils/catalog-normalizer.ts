/**
 * Nirosha India - Enterprise Catalog Ingestion & Normalization Engine
 * Standardizes product titles, category taxonomies, and JSONB specification keys.
 */

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Strips HTML entities, retail prefixes, pipe-delimited SEO marketing dumps,
 * and trailing model/SKU parentheses from raw scraped or imported product titles.
 */
export function sanitizeTitle(rawName: string): string {
  if (!rawName) return '';
  let name = rawName;

  // 1. Decode HTML entities
  name = name
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  // 2. Strip retail / scraping prefixes
  name = name.replace(/^(Store Display Unit\s*-\s*|Refurbished\s*-\s*|Unboxed\s*-\s*|Open Box\s*-\s*)/i, '');

  // 3. Truncate at first marketing pipe character '|'
  if (name.includes('|')) {
    name = name.split('|')[0].trim();
  }

  // 4. Clean RAM/Storage parenthetical dumps e.g. (8GB RAM, 128GB Storage)
  name = name.replace(/\s*\(\s*\d+\s*GB\s*(?:RAM|ROM|Storage)(?:[,/]\s*\d+\s*(?:GB|TB)\s*(?:RAM|ROM|Storage|SSD))?\s*\)/gi, '');

  // 5. Remove trailing chip marketing tags right before/after parentheses
  name = name.replace(/\s+(?:Qualcomm\s+Snapdragon|Snapdragon|MediaTek\s+Dimensity|Exynos)\s+[A-Za-z0-9\s+]+$/i, '');

  // 6. Handle trailing SKU / part codes after closing parenthesis
  name = name.replace(/\)\s+[A-Z0-9.\-_/]{5,}\s*$/i, ')');

  // 7. Remove trailing model code / color noise in parentheses like (IFPROINVCNV375GDCMI2SY, Crystal Mirror)
  name = name.replace(/\s*\(([^)]+)\)\s*([A-Za-z0-9\s]*)$/, (match, inner, trailing) => {
    if (/\b(cm|inch|inches|litres?|ltr|l|kg|ton|stars?|star|watt|w)\b/i.test(inner)) {
      return match;
    }
    return trailing ? ' ' + trailing.trim() : '';
  });

  // 8. Simplify giant laptop spec dumps in parentheses
  if (name.includes('(') && name.includes('/')) {
    name = name.replace(/\(([^)]*\/[^)]*)\)/g, (match, inner) => {
      const sizeMatch = inner.match(/\b(\d+(?:\.\d+)?\s*(?:Inch|cm))\b/i);
      const gpuMatch = inner.match(/\b(RTX\s*\d+|GTX\s*\d+|Intel|AMD|Snapdragon)\b/i);
      const parts: string[] = [];
      if (sizeMatch) parts.push(sizeMatch[1]);
      if (gpuMatch) parts.push(gpuMatch[1]);
      return parts.length > 0 ? `(${parts.join(', ')})` : '';
    });
  }

  return name.replace(/\s+/g, ' ').replace(/\s+[,.\-_/]\s*$/, '').trim();
}

// Canonical Key Mappings
export const CANONICAL_SPEC_ALIASES: Record<string, string[]> = {
  ram: ['ram', 'memory', 'system memory', 'ram memory', 'unified memory', 'system ram', 'ram size'],
  processor: ['processor', 'cpu', 'processor type', 'processor name', 'chipset', 'cpu model'],
  storage: ['storage', 'hard drive', 'internal storage', 'ssd capacity', 'hdd capacity', 'storage capacity', 'internal memory'],
  display: ['display', 'screen size', 'display size', 'screen resolution', 'panel type', 'display type'],
  capacity: ['capacity', 'total capacity', 'net capacity', 'volume', 'cooling capacity'],
  energy_rating: ['energy star rating', 'star rating', 'energy rating', 'bee star rating', 'bee rating'],
  warranty: ['warranty', 'warranty period', 'manufacturer warranty', 'service warranty'],
  os: ['operating system', 'os', 'operating system type', 'platform'],
  graphics: ['graphics', 'gpu', 'graphics processor', 'dedicated graphics'],
  color: ['color', 'colour', 'shade'],
  battery: ['battery', 'battery life', 'battery capacity', 'battery run time'],
  connectivity: ['connectivity', 'bluetooth', 'wi-fi', 'wifi', 'ports'],
  in_the_box: ['in the box', 'box contents', 'package contents']
};

const ALIAS_MAP = new Map<string, string>();
for (const [canonical, aliases] of Object.entries(CANONICAL_SPEC_ALIASES)) {
  ALIAS_MAP.set(canonical.toLowerCase(), canonical);
  for (const a of aliases) {
    ALIAS_MAP.set(a.toLowerCase(), canonical);
  }
}

/**
 * Standardizes arbitrary specification key-value pairs into lowercase canonical attributes,
 * preserving all unmapped manufacturer attributes in an `extra` dictionary.
 */
export function normalizeSpecs(rawSpecs: Record<string, any> | null | undefined): Record<string, any> {
  if (!rawSpecs || typeof rawSpecs !== 'object' || Array.isArray(rawSpecs)) {
    return { extra: {} };
  }

  const normalized: Record<string, any> = {};
  const extra: Record<string, any> = {};

  for (const [key, value] of Object.entries(rawSpecs)) {
    if (value === null || value === undefined || value === '') continue;

    const cleanKey = key.trim().toLowerCase();
    const canonical = ALIAS_MAP.get(cleanKey);

    if (canonical) {
      if (!normalized[canonical] || String(value).length > String(normalized[canonical]).length) {
        normalized[canonical] = value;
      }
    } else {
      extra[key.trim()] = value;
    }
  }

  if (Object.keys(extra).length > 0) {
    normalized.extra = extra;
  }

  return normalized;
}
