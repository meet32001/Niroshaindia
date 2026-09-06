'use server';

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

export interface SearchResultItem {
  id: string | number;
  name: string;
  slug: string;
  categoryName: string;
  categorySlug: string;
  brandName: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  imageUrl: string;
  inStock: boolean;
}

export interface SearchResponse {
  products: SearchResultItem[];
  totalCount: number;
  suggestedCategories: { name: string; slug: string }[];
  isFallback: boolean;
}

const querySchema = z.string().trim().max(100);

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

export async function liveSearch(rawQuery: string): Promise<SearchResponse> {
  const parseResult = querySchema.safeParse(rawQuery);
  if (!parseResult.success) {
    return { products: [], totalCount: 0, suggestedCategories: [], isFallback: false };
  }

  const trimmed = parseResult.data;
  if (!trimmed || trimmed.length < 2) {
    return { products: [], totalCount: 0, suggestedCategories: [], isFallback: false };
  }

  const supabase = getSupabaseAdmin();
  const defaultFallbackImg =
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';

  try {
    // 1. Search matching categories
    const { data: matchedCategories } = await supabase
      .from('categories')
      .select('name, slug')
      .ilike('name', `%${trimmed}%`)
      .limit(3);

    // 2. Search products matching name or description
    const { data: products, count } = await supabase
      .from('products')
      .select(
        `
        id,
        name,
        slug,
        category:categories(name, slug),
        brand:brands(name),
        variants:product_variants(
          id,
          price_cents,
          compare_at_price_cents,
          images:product_images(image_url, is_featured, sort_order),
          inventory:warehouse_inventory(quantity_on_hand, quantity_reserved)
        )
      `,
        { count: 'exact' }
      )
      .eq('is_active', true)
      .or(`name.ilike.%${trimmed}%,description.ilike.%${trimmed}%`)
      .limit(4);

    if (products && products.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formatted: SearchResultItem[] = products.map((p: any) => {
        const rawVariants = p.variants || [];
        const v = rawVariants[0] || {};
        const rawImgs = v.images || [];
        const featuredImg = rawImgs.find((i: { is_featured?: boolean }) => i.is_featured);
        const imageUrl = featuredImg?.image_url || rawImgs[0]?.image_url || defaultFallbackImg;

        const inv = Array.isArray(v.inventory) ? v.inventory[0] : v.inventory;
        const onHand = inv?.quantity_on_hand ?? 10;
        const reserved = inv?.quantity_reserved ?? 0;
        const inStock = onHand - reserved > 0;

        const categoryObj = Array.isArray(p.category) ? p.category[0] : p.category;
        const brandObj = Array.isArray(p.brand) ? p.brand[0] : p.brand;

        return {
          id: p.id,
          name: p.name || 'Product',
          slug: typeof p.slug === 'string' ? p.slug : p.slug?.current || 'product',
          categoryName: categoryObj?.name || 'Electronics',
          categorySlug: categoryObj?.slug || '',
          brandName: brandObj?.name || 'Nirosha',
          priceCents: v.price_cents || 0,
          compareAtPriceCents: v.compare_at_price_cents || null,
          imageUrl,
          inStock,
        };
      });

      return {
        products: formatted,
        totalCount: count || formatted.length,
        suggestedCategories: matchedCategories || [],
        isFallback: false,
      };
    }

    // 3. Fallback: No direct matches -> fetch active/popular products
    const { data: fallbackProducts } = await supabase
      .from('products')
      .select(
        `
        id,
        name,
        slug,
        category:categories(name, slug),
        brand:brands(name),
        variants:product_variants(
          id,
          price_cents,
          compare_at_price_cents,
          images:product_images(image_url, is_featured, sort_order),
          inventory:warehouse_inventory(quantity_on_hand, quantity_reserved)
        )
      `
      )
      .eq('is_active', true)
      .limit(3);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedFallback: SearchResultItem[] = (fallbackProducts || []).map((p: any) => {
      const rawVariants = p.variants || [];
      const v = rawVariants[0] || {};
      const rawImgs = v.images || [];
      const featuredImg = rawImgs.find((i: { is_featured?: boolean }) => i.is_featured);
      const imageUrl = featuredImg?.image_url || rawImgs[0]?.image_url || defaultFallbackImg;

      const categoryObj = Array.isArray(p.category) ? p.category[0] : p.category;
      const brandObj = Array.isArray(p.brand) ? p.brand[0] : p.brand;

      return {
        id: p.id,
        name: p.name || 'Product',
        slug: typeof p.slug === 'string' ? p.slug : p.slug?.current || 'product',
        categoryName: categoryObj?.name || 'Electronics',
        categorySlug: categoryObj?.slug || '',
        brandName: brandObj?.name || 'Nirosha',
        priceCents: v.price_cents || 0,
        compareAtPriceCents: v.compare_at_price_cents || null,
        imageUrl,
        inStock: true,
      };
    });

    return {
      products: formattedFallback,
      totalCount: 0,
      suggestedCategories: matchedCategories || [],
      isFallback: true,
    };
  } catch (error) {
    console.error('[LIVE SEARCH EXCEPTION]:', error);
    return { products: [], totalCount: 0, suggestedCategories: [], isFallback: false };
  }
}
