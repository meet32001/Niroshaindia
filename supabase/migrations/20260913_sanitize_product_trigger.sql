-- Migration: Automatic Title Sanitization & SEO Cleaning Trigger on public.products
-- Description: Automatically strips HTML entities, marketing pipe separators, retail prefixes, and trailing SKU noise.

CREATE OR REPLACE FUNCTION public.fn_sanitize_product_title()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Decode HTML entities
  NEW.name := replace(NEW.name, '&amp;', '&');
  NEW.name := replace(NEW.name, '&quot;', '"');
  NEW.name := replace(NEW.name, '&#39;', '''');
  NEW.name := replace(NEW.name, '&lt;', '<');
  NEW.name := replace(NEW.name, '&gt;', '>');

  -- 2. Remove retail and scraping artifacts
  NEW.name := regexp_replace(NEW.name, '^(Store Display Unit|Refurbished|Unboxed|Open Box)\s*-\s*', '', 'i');

  -- 3. Truncate at first pipe character '|' if present
  IF position('|' in NEW.name) > 0 THEN
    NEW.name := trim(split_part(NEW.name, '|', 1));
  END IF;

  -- 4. Strip redundant RAM/Storage dumps in parentheses e.g. (8GB RAM, 128GB Storage)
  NEW.name := regexp_replace(NEW.name, '\s*\(\s*\d+\s*GB\s*(?:RAM|ROM|Storage)(?:[,/]\s*\d+\s*(?:GB|TB)\s*(?:RAM|ROM|Storage|SSD))?\s*\)', '', 'gi');

  -- 5. Strip trailing uppercase SKU / part codes in parentheses (unless mentioning screen/capacity sizing)
  IF NEW.name ~ '\s*\([A-Z0-9\-_/]{5,}(?:\s*,\s*[^)]+)?\)\s*$' AND NOT NEW.name ~* '\b(cm|inch|inches|litres?|ltr|l|kg|ton|stars?|star|watt|w)\b' THEN
    NEW.name := regexp_replace(NEW.name, '\s*\([A-Z0-9\-_/]{5,}(?:\s*,\s*[^)]+)?\)\s*$', '');
  END IF;

  -- 6. Clean multiple spaces and trailing punctuation
  NEW.name := trim(regexp_replace(regexp_replace(NEW.name, '\s+', ' ', 'g'), '\s+[,.\-_/]\s*$', ''));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sanitize_product_title ON public.products;
CREATE TRIGGER trg_sanitize_product_title
BEFORE INSERT OR UPDATE OF name ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.fn_sanitize_product_title();
