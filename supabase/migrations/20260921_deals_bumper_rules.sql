-- Migration: Add discount_percent and is_bumper_deal to weekly_deals
ALTER TABLE public.weekly_deals
ADD COLUMN IF NOT EXISTS discount_percent INT NOT NULL DEFAULT 10,
ADD COLUMN IF NOT EXISTS is_bumper_deal BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_weekly_deals_bumper ON public.weekly_deals(is_bumper_deal);
