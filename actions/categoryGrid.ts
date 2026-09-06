'use server';

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { MOCK_PRODUCTS, normalizeProduct } from '@/lib/db/products';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'placeholder-key';
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

const slugSchema = z.string().trim().max(100);

export async function getCategoryGridProducts(categorySlug: string) {
  const parseResult = slugSchema.safeParse(categorySlug);
  if (!parseResult.success) return [];

  const slug = parseResult.data.toLowerCase();
  const supabase = getSupabaseAdmin();

  try {
    // 1. SPECIFIC CATEGORY FILTER (AC, TV, Mobiles, Laptops, etc.)
    if (slug !== 'all') {
      let query = supabase
        .from('products')
        .select(
          `
          id,
          name,
          slug,
          description,
          is_active,
          brand:brands ( id, name, slug, logo_url ),
          category:categories ( id, name, slug, description ),
          variants:product_variants (
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
        .eq('is_active', true);

      if (slug === 'ac') {
        query = query.or('name.ilike.%AC%,name.ilike.%Air Conditioner%,description.ilike.%split ac%');
      } else if (slug === 'tv') {
        query = query.or('name.ilike.%TV%,name.ilike.%Television%,name.ilike.%OLED%,name.ilike.%Smart TV%');
      } else if (slug === 'mobiles-tablets-accessories') {
        query = query.or('name.ilike.%Phone%,name.ilike.%Mobile%,name.ilike.%Tablet%,name.ilike.%iPad%,name.ilike.%Galaxy%');
      } else if (slug === 'laptops-accessories') {
        query = query.or('name.ilike.%Laptop%,name.ilike.%MacBook%,name.ilike.%Notebook%,name.ilike.%ProBook%');
      } else if (slug === 'home-appliances') {
        query = query.or('name.ilike.%Purifier%,name.ilike.%Refrigerator%,name.ilike.%Washing%,name.ilike.%Vacuum%');
      } else if (slug === 'kitchen-appliances') {
        query = query.or('name.ilike.%Air Fryer%,name.ilike.%Blender%,name.ilike.%Oven%,name.ilike.%Mixer%');
      } else if (slug === 'headphones-speakers') {
        query = query.or('name.ilike.%Headphone%,name.ilike.%TWS%,name.ilike.%Speaker%,name.ilike.%Sony WH%');
      } else if (slug === 'brand-stores') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.or(`name.ilike.%${slug}%,description.ilike.%${slug}%`);
      }

      const { data: products, error } = await query.limit(15);

      if (!error && Array.isArray(products) && products.length > 0) {
        return products.map(normalizeProduct);
      }

      // Fallback filtering on MOCK_PRODUCTS if database query returns fewer items
      let mockFiltered = MOCK_PRODUCTS.map(normalizeProduct);
      if (slug === 'ac') {
        mockFiltered = mockFiltered.filter(
          (p) => (p.name || '').toLowerCase().includes('ac') || (p.category || '').toLowerCase().includes('appliance')
        );
      } else if (slug === 'tv') {
        mockFiltered = mockFiltered.filter(
          (p) => (p.name || '').toLowerCase().includes('tv') || (p.category || '').toLowerCase().includes('smart')
        );
      } else if (slug === 'mobiles-tablets-accessories') {
        mockFiltered = mockFiltered.filter(
          (p) => (p.category || '').toLowerCase().includes('gadget') || (p.name || '').toLowerCase().includes('phone')
        );
      } else if (slug === 'laptops-accessories') {
        mockFiltered = mockFiltered.filter(
          (p) => (p.name || '').toLowerCase().includes('laptop') || (p.name || '').toLowerCase().includes('probook')
        );
      }

      return mockFiltered.slice(0, 15);
    }

    // 2. "ALL PRODUCTS": Cross-Category Balanced Distribution (3x5 = 15 items)
    const targetCategoryKeywords = [
      { key: 'phone', filter: 'name.ilike.%Phone%,name.ilike.%Galaxy%,name.ilike.%iPhone%' },
      { key: 'ac', filter: 'name.ilike.%AC%,name.ilike.%Air Conditioner%,name.ilike.%Inverter%' },
      { key: 'laptop', filter: 'name.ilike.%Laptop%,name.ilike.%MacBook%,name.ilike.%ProBook%' },
      { key: 'tv', filter: 'name.ilike.%TV%,name.ilike.%OLED%,name.ilike.%Smart TV%' },
      { key: 'audio_kitchen', filter: 'name.ilike.%Headphone%,name.ilike.%Purifier%,name.ilike.%Air Fryer%,name.ilike.%Sony%' },
    ];

    const bucketPromises = targetCategoryKeywords.map((b) =>
      supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          description,
          is_active,
          brand:brands ( id, name, slug, logo_url ),
          category:categories ( id, name, slug, description ),
          variants:product_variants (
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
        `)
        .eq('is_active', true)
        .or(b.filter)
        .limit(4)
    );

    const bucketResults = await Promise.all(bucketPromises);

    // Interleave across buckets
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

    // Fill remaining slots if pool has fewer than 15 items
    if (pool.length < 15) {
      const existingIds = pool.map((p) => p.id);
      const { data: fillers } = await supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          description,
          is_active,
          brand:brands ( id, name, slug, logo_url ),
          category:categories ( id, name, slug, description ),
          variants:product_variants (
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
        `)
        .eq('is_active', true)
        .not('id', 'in', `(${existingIds.length ? existingIds.join(',') : '0'})`)
        .limit(15 - pool.length);

      if (fillers && fillers.length > 0) {
        pool.push(...fillers);
      }
    }

    // Fallback to MOCK_PRODUCTS if database return pool is smaller than 15
    if (pool.length < 15) {
      const mockNormalized = MOCK_PRODUCTS.map(normalizeProduct);
      for (const mockItem of mockNormalized) {
        if (pool.length >= 15) break;
        if (!pool.some((p) => p.id === mockItem.id || p.id === mockItem._id)) {
          pool.push(mockItem);
        }
      }
    }

    // Deduplicate by ID
    const uniqueMap = new Map();
    pool.forEach((p) => {
      const pid = p.id || p._id;
      if (!uniqueMap.has(pid)) {
        uniqueMap.set(pid, p);
      }
    });

    const uniquePool = Array.from(uniqueMap.values()).slice(0, 15);

    // Fisher-Yates Shuffle for dynamic multi-category placement
    for (let i = uniquePool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [uniquePool[i], uniquePool[j]] = [uniquePool[j], uniquePool[i]];
    }

    return uniquePool.map(normalizeProduct);
  } catch (error) {
    console.error('[CATEGORY GRID BALANCED SAMPLING EXCEPTION]:', error);
    return MOCK_PRODUCTS.map(normalizeProduct).slice(0, 15);
  }
}
