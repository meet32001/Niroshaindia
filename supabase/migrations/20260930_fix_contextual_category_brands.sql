-- Migration: 20260930_fix_contextual_category_brands.sql
-- Description: Fix get_contextual_category_brands RPC function with support for cat_slug, p_category_slug, p_category_id, and zero-parameter calls.
-- Grants execute permission to anon, authenticated, and service_role, and refreshes the PostgREST schema cache.

DROP FUNCTION IF EXISTS public.get_contextual_category_brands(TEXT);
DROP FUNCTION IF EXISTS public.get_contextual_category_brands();
DROP FUNCTION IF EXISTS public.get_contextual_category_brands(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.get_contextual_category_brands(TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.get_contextual_category_brands(
  cat_slug TEXT DEFAULT NULL,
  p_category_id TEXT DEFAULT NULL,
  p_category_slug TEXT DEFAULT NULL
)
RETURNS TABLE (
  brand_id TEXT,
  brand_name TEXT,
  brand_slug TEXT,
  product_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slug TEXT;
  v_cat_id BIGINT;
BEGIN
  -- Normalize slug from cat_slug or p_category_slug
  v_slug := NULLIF(TRIM(COALESCE(cat_slug, p_category_slug)), '');
  IF v_slug = 'all' THEN
    v_slug := NULL;
  END IF;

  -- Parse category ID if provided
  IF p_category_id IS NOT NULL AND p_category_id ~ '^[0-9]+$' THEN
    v_cat_id := p_category_id::BIGINT;
  ELSIF v_slug IS NOT NULL AND v_slug ~ '^[0-9]+$' THEN
    -- If numeric ID was passed in slug position
    v_cat_id := v_slug::BIGINT;
    v_slug := NULL;
  END IF;

  -- Case 1: No category filter specified -> return all brands with active products
  IF v_slug IS NULL AND v_cat_id IS NULL THEN
    RETURN QUERY
    SELECT 
      b.id::TEXT AS brand_id,
      b.name::TEXT AS brand_name,
      b.slug::TEXT AS brand_slug,
      COUNT(p.id)::BIGINT AS product_count
    FROM public.brands b
    JOIN public.products p ON p.brand_id = b.id AND p.is_active = true
    GROUP BY b.id, b.name, b.slug
    HAVING COUNT(p.id) > 0
    ORDER BY product_count DESC;
  ELSE
    -- Case 2: Specific category (and all its subcategories)
    RETURN QUERY
    WITH RECURSIVE target_cats AS (
      SELECT c.id FROM public.categories c 
      WHERE (v_slug IS NOT NULL AND c.slug = v_slug)
         OR (v_cat_id IS NOT NULL AND c.id = v_cat_id)
      UNION
      SELECT child.id FROM public.categories child
      JOIN target_cats parent ON child.parent_id = parent.id
    )
    SELECT 
      b.id::TEXT AS brand_id,
      b.name::TEXT AS brand_name,
      b.slug::TEXT AS brand_slug,
      COUNT(p.id)::BIGINT AS product_count
    FROM public.brands b
    JOIN public.products p ON p.brand_id = b.id AND p.is_active = true
    WHERE p.category_id IN (SELECT id FROM target_cats)
    GROUP BY b.id, b.name, b.slug
    HAVING COUNT(p.id) > 0
    ORDER BY product_count DESC;
  END IF;
END;
$$;

-- Grant execution to anon (browser), authenticated users, and service_role
GRANT EXECUTE ON FUNCTION public.get_contextual_category_brands(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;

-- Invalidate PostgREST schema cache to ensure immediate discovery
NOTIFY pgrst, 'reload schema';
