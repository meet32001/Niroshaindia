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
    let query = supabase
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
      .eq('is_active', true);

    if (slug !== 'all') {
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
    }

    const { data: products, error } = await query.limit(15);

    if (!error && Array.isArray(products) && products.length > 0) {
      return products.map(normalizeProduct);
    }

    // Fallback filtering on MOCK_PRODUCTS if database query returns fewer items
    let mockFiltered = MOCK_PRODUCTS.map(normalizeProduct);
    if (slug !== 'all') {
      if (slug === 'ac') {
        mockFiltered = mockFiltered.filter((p) => (p.name || '').toLowerCase().includes('ac') || (p.category || '').toLowerCase().includes('appliance'));
      } else if (slug === 'tv') {
        mockFiltered = mockFiltered.filter((p) => (p.name || '').toLowerCase().includes('tv') || (p.category || '').toLowerCase().includes('smart'));
      } else if (slug === 'mobiles-tablets-accessories') {
        mockFiltered = mockFiltered.filter((p) => (p.category || '').toLowerCase().includes('gadget') || (p.name || '').toLowerCase().includes('phone'));
      } else if (slug === 'laptops-accessories') {
        mockFiltered = mockFiltered.filter((p) => (p.name || '').toLowerCase().includes('laptop') || (p.name || '').toLowerCase().includes('probook'));
      }
    }

    return mockFiltered.slice(0, 15);
  } catch (error) {
    console.error('[CATEGORY GRID ACTION EXCEPTION]:', error);
    return MOCK_PRODUCTS.map(normalizeProduct).slice(0, 15);
  }
}
