'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { z } from 'zod';
import { MOCK_PRODUCTS, normalizeProduct } from '@/lib/db/products';
import { PREVIEW_TABS } from '@/constants/navigation';

const slugSchema = z.string().trim().max(100);

// Backward-compatible category slug mapping for legacy URLs
const LEGACY_SLUG_MAP: Record<string, string> = {
  'mobiles-tablets-accessories': 'mobiles-tablets',
  'laptops-accessories': 'laptops-pcs',
  tv: 'tv-vision',
  'headphones-speakers': 'audio-headphones',
  'air-fryers-deep-fryers': 'air-fryers',
  'electric-kettles-coffee-makers': 'kettles-coffee-makers',
  'induction-cooktops-stoves': 'cooktops-stoves',
  'mixer-grinders-juicers-blenders': 'mixers-juicers-blenders',
};

export async function getCategoryGridProducts(categorySlug: string) {
  const parseResult = slugSchema.safeParse(categorySlug);
  if (!parseResult.success) return [];

  const rawSlug = parseResult.data.toLowerCase();
  const slug = LEGACY_SLUG_MAP[rawSlug] || rawSlug;
  const supabase = supabaseAdmin;

  try {
    // 1. SPECIFIC TAB FILTER (Strict category slug mapping, NO fuzzy name matching)
    if (slug !== 'all') {
      const targetTab = PREVIEW_TABS.find((t) => t.id === slug);
      const targetSlugs = targetTab ? targetTab.categorySlugs : [slug];

      const { data: products, error } = await supabase
        .from('products')
        .select(
          `
          id,
          name,
          slug,
          description,
          is_active,
          min_price_cents,
          max_price_cents,
          brand:brands ( id, name, slug, logo_url ),
          category:categories!inner ( id, name, slug, description ),
          variants:product_variants!inner (
            id,
            sku,
            name,
            price_cents,
            compare_at_price_cents,
            is_serialized,
            weight_grams,
            dimensions_mm_l_w_h,
            images:product_images ( id, image_url, sort_order, is_featured ),
            specifications:product_specifications ( specs ),
            inventory:warehouse_inventory ( quantity_on_hand, quantity_reserved )
          )
        `
        )
        .in('category.slug', targetSlugs)
        .gt('product_variants.price_cents', 0)
        .eq('is_active', true)
        .order('id', { ascending: false })
        .limit(15);

      if (!error && Array.isArray(products) && products.length > 0) {
        return products.map(normalizeProduct);
      }

      // Safe fallback from mock products
      return MOCK_PRODUCTS.slice(0, 15).map(normalizeProduct);
    }

    // 2. "ALL PRODUCTS": Balanced multi-category showcase across flagship devices
    const flagshipCategorySlugs = [
      ['smartphones'],
      ['laptops-macbooks', 'gaming-laptops'],
      ['air-conditioners'],
      ['4k-oled-smart-tvs', '4k-smart-tvs'],
      ['tws-earbuds', 'headphones', 'bluetooth-speakers'],
      ['refrigerators', 'washing-machines', 'air-fryers'],
    ];

    const bucketPromises = flagshipCategorySlugs.map((slugs) =>
      supabase
        .from('products')
        .select(
          `
          id,
          name,
          slug,
          description,
          is_active,
          min_price_cents,
          max_price_cents,
          brand:brands ( id, name, slug, logo_url ),
          category:categories!inner ( id, name, slug, description ),
          variants:product_variants!inner (
            id,
            sku,
            name,
            price_cents,
            compare_at_price_cents,
            is_serialized,
            weight_grams,
            dimensions_mm_l_w_h,
            images:product_images ( id, image_url, sort_order, is_featured ),
            specifications:product_specifications ( specs ),
            inventory:warehouse_inventory ( quantity_on_hand, quantity_reserved )
          )
        `
        )
        .in('category.slug', slugs)
        .gt('product_variants.price_cents', 0)
        .eq('is_active', true)
        .order('id', { ascending: false })
        .limit(3)
    );

    const bucketResults = await Promise.all(bucketPromises);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pool: any[] = [];
    const maxItemsPerBucket = 3;

    for (let i = 0; i < maxItemsPerBucket; i++) {
      for (const res of bucketResults) {
        if (res.data && res.data[i]) {
          pool.push(res.data[i]);
        }
      }
    }

    // Deduplicate by ID
    const uniqueMap = new Map();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pool.forEach((p: any) => {
      const pid = p.id || p._id;
      if (!uniqueMap.has(pid)) {
        uniqueMap.set(pid, p);
      }
    });

    const uniquePool = Array.from(uniqueMap.values()).slice(0, 15);
    return uniquePool.map(normalizeProduct);
  } catch (error) {
    console.error('[CATEGORY GRID QUERY EXCEPTION]:', error);
    return MOCK_PRODUCTS.map(normalizeProduct).slice(0, 15);
  }
}
