-- 1. Add pricing cache columns to products for fast indexed sorting & filtering
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS min_price_cents BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_price_cents BIGINT DEFAULT 0;

-- 2. Populate existing products with their lowest & highest variant price
UPDATE public.products p
SET 
  min_price_cents = COALESCE((
    SELECT MIN(pv.price_cents) 
    FROM public.product_variants pv 
    WHERE pv.product_id = p.id AND pv.price_cents > 0
  ), 0),
  max_price_cents = COALESCE((
    SELECT MAX(pv.price_cents) 
    FROM public.product_variants pv 
    WHERE pv.product_id = p.id AND pv.price_cents > 0
  ), 0);

-- 3. Create high-performance B-Tree indexes for lightning-fast shop sorting
CREATE INDEX IF NOT EXISTS idx_products_min_price_cents ON public.products(min_price_cents);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- 4. Create trigger to automatically keep min_price_cents updated when variants change
CREATE OR REPLACE FUNCTION public.fn_sync_product_price_cache()
RETURNS TRIGGER AS $$
DECLARE
  target_prod_id BIGINT;
BEGIN
  target_prod_id := COALESCE(NEW.product_id, OLD.product_id);
  
  UPDATE public.products
  SET 
    min_price_cents = COALESCE((
      SELECT MIN(price_cents) FROM public.product_variants WHERE product_id = target_prod_id AND price_cents > 0
    ), 0),
    max_price_cents = COALESCE((
      SELECT MAX(price_cents) FROM public.product_variants WHERE product_id = target_prod_id AND price_cents > 0
    ), 0)
  WHERE id = target_prod_id;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_variant_price_cache ON public.product_variants;
CREATE TRIGGER trg_sync_variant_price_cache
AFTER INSERT OR UPDATE OR DELETE ON public.product_variants
FOR EACH ROW
EXECUTE FUNCTION public.fn_sync_product_price_cache();

-- 5. RPC Function: Get contextual brands with live product counts for selected category
CREATE OR REPLACE FUNCTION public.get_contextual_category_brands(cat_slug TEXT DEFAULT NULL)
RETURNS TABLE (
  brand_id BIGINT,
  brand_name TEXT,
  brand_slug TEXT,
  product_count BIGINT
) AS $$
BEGIN
  IF cat_slug IS NULL OR cat_slug = ' OR cat_slug = 'all' THEN
    RETURN QUERY
    SELECT 
      b.id,
      b.name,
      b.slug,
      COUNT(p.id) AS product_count
    FROM public.brands b
    JOIN public.products p ON p.brand_id = b.id AND p.is_active = true
    GROUP BY b.id, b.name, b.slug
    HAVING COUNT(p.id) > 0
    ORDER BY product_count DESC
    LIMIT 20;
  ELSE
    RETURN QUERY
    WITH target_cats AS (
      SELECT c.id FROM public.categories c WHERE c.slug = cat_slug
      UNION
      SELECT child.id FROM public.categories child
      JOIN public.categories parent ON child.parent_id = parent.id
      WHERE parent.slug = cat_slug
    )
    SELECT 
      b.id,
      b.name,
      b.slug,
      COUNT(p.id) AS product_count
    FROM public.brands b
    JOIN public.products p ON p.brand_id = b.id AND p.is_active = true
    WHERE p.category_id IN (SELECT id FROM target_cats)
    GROUP BY b.id, b.name, b.slug
    HAVING COUNT(p.id) > 0
    ORDER BY product_count DESC;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;
