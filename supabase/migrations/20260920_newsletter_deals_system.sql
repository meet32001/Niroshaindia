-- ===============================================================
-- NIROSHA INDIA: VIP NEWSLETTER & HIGH-TICKET WEEKLY DEALS SYSTEM
-- Migration: 20260920_newsletter_deals_system.sql
-- ===============================================================

-- 1. Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  welcome_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON public.newsletter_subscribers(is_active);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anonymous users can insert/subscribe
CREATE POLICY "Allow anonymous subscription" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Service role can read and update
CREATE POLICY "Allow service role full access to subscribers" ON public.newsletter_subscribers
  FOR ALL USING (auth.role() = 'service_role');


-- 2. Weekly Featured Deals Table
CREATE TABLE IF NOT EXISTS public.weekly_deals (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  week_number INT NOT NULL,
  year INT NOT NULL,
  product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  deal_price_cents BIGINT NOT NULL,
  coupon_code TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_weekly_deals_active ON public.weekly_deals(starts_at, expires_at);
CREATE INDEX IF NOT EXISTS idx_weekly_deals_week_year ON public.weekly_deals(year, week_number);

-- Enable RLS
ALTER TABLE public.weekly_deals ENABLE ROW LEVEL SECURITY;

-- Public can read active deals
CREATE POLICY "Allow public read on active weekly deals" ON public.weekly_deals
  FOR SELECT USING (true);

-- Service role can manage weekly deals
CREATE POLICY "Allow service role full access to weekly deals" ON public.weekly_deals
  FOR ALL USING (auth.role() = 'service_role');
