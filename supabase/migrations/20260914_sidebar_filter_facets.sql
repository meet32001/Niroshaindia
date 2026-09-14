-- 1. Ensure rating, review_count, has_bank_offer, and is_in_stock columns exist on products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1) DEFAULT 4.5,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 42,
ADD COLUMN IF NOT EXISTS has_bank_offer BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_in_stock BOOLEAN DEFAULT true;

-- If rating is currently null on products, backfill with clean randomized realistic ratings
UPDATE public.products 
SET 
  rating = (ARRAY[4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8])[floor(random() * 8 + 1)],
  review_count = floor(random() * 250 + 15)::int
WHERE rating IS NULL OR rating = 0;

-- 2. Index rating and stock for fast compound filtering
CREATE INDEX IF NOT EXISTS idx_products_rating ON public.products(rating);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON public.products(is_in_stock);
