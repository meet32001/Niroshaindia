-- Migration: Add anchor_price_cents and ensure bumper deal columns on weekly_deals
ALTER TABLE public.weekly_deals 
ADD COLUMN IF NOT EXISTS anchor_price_cents BIGINT,
ADD COLUMN IF NOT EXISTS is_bumper_deal BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS discount_percent INT NOT NULL DEFAULT 10;

CREATE INDEX IF NOT EXISTS idx_weekly_deals_bumper ON public.weekly_deals(is_bumper_deal);
