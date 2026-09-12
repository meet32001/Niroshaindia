"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Star, ArrowLeftRight, HelpCircle, Share2, Truck, RotateCcw, Package } from "lucide-react";
import { ProductGallery } from "@/components/product/ProductGallery";
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { VariantSelector, Variant } from "@/components/product/VariantSelector";
import { ProductSpecsTable } from "@/components/product/ProductSpecsTable";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { AddToWishlistButton } from "@/components/product/AddToWishlistButton";
import { Badge } from "@/components/ui/badge";

export interface ProductDetailViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product: any;
  initialSku?: string;
}

export function ProductDetailView({ product, initialSku }: ProductDetailViewProps) {
  const searchParams = useSearchParams();

  // Extract variants safely
  const rawVariants = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (product.variants || product.product_variants || []) as any[];
  }, [product]);

  // Normalized variants array
  const variants: Variant[] = useMemo(() => {
    if (rawVariants.length === 0) {
      return [
        {
          id: product.id || "var-default",
          sku: product.sku || "SKU-DEFAULT",
          name: product.name || "Standard Edition",
          price: product.price || 0,
          comparePrice: product.discountPrice || 0,
          stock: product.stock !== undefined ? product.stock : 10,
          isStock: (product.stock !== undefined ? product.stock : 10) > 0,
          images: product.images || [],
          specs: product.specs || {},
          weight_grams: product.weight_grams || null,
          dimensions_mm_l_w_h: product.dimensions_mm_l_w_h || null,
        },
      ];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rawVariants.map((v: any, index: number) => ({
      id: v.id || `var-${index}`,
      sku: v.sku || `SKU-${index}`,
      name: v.name || `${product.name} (Option ${index + 1})`,
      price: v.price !== undefined ? v.price : (v.price_cents ? v.price_cents / 100 : product.price || 0),
      price_cents: v.price_cents ?? (v.price ? v.price * 100 : 0),
      comparePrice: v.comparePrice !== undefined ? v.comparePrice : (v.compare_at_price_cents ? v.compare_at_price_cents / 100 : 0),
      compare_at_price_cents: v.compare_at_price_cents ?? (v.comparePrice ? v.comparePrice * 100 : 0),
      stock: v.stock !== undefined ? v.stock : 10,
      isStock: v.isStock ?? (v.stock !== undefined ? v.stock > 0 : true),
      images: v.images && v.images.length > 0 ? v.images : product.images || [],
      specs: v.specs || product.specs || {},
      weight_grams: v.weight_grams || null,
      dimensions_mm_l_w_h: v.dimensions_mm_l_w_h || null,
    }));
  }, [rawVariants, product]);

  // Determine initial active variant from URL or props
  const querySku = searchParams.get("sku") || searchParams.get("variant") || initialSku;
  const initialVariant = useMemo(() => {
    if (querySku) {
      const match = variants.find(
        (v) => v.sku.toLowerCase() === querySku.toLowerCase()
      );
      if (match) return match;
    }
    return variants[0];
  }, [variants, querySku]);

  const [activeVariant, setActiveVariant] = useState<Variant>(initialVariant);

  // Sync state if URL search params change externally
  useEffect(() => {
    if (querySku) {
      const match = variants.find(
        (v) => v.sku.toLowerCase() === querySku.toLowerCase()
      );
      if (match && match.sku !== activeVariant.sku) {
        setActiveVariant(match);
      }
    }
  }, [querySku, variants, activeVariant.sku]);

  const name = product.name || product.title || "Electronics Product";
  const description =
    product.description ||
    "High-performance electronics gadget imported directly with official manufacturer specifications and brand warranty.";
  const brand =
    typeof product.brand === "string"
      ? product.brand
      : product.brand?.title || product.brand?.name || "Nirosha";

  const categories = Array.isArray(product.categories)
    ? product.categories.join(", ")
    : typeof product.category === "string"
    ? product.category
    : product.productType || "Electronics";

  const isStock = activeVariant.isStock ?? (activeVariant.stock ? activeVariant.stock > 0 : true);
  const activeStock = activeVariant.stock ?? 10;

  // Active Images tied directly to selected variant
  const galleryImages =
    activeVariant.images && activeVariant.images.length > 0
      ? activeVariant.images
      : product.images || [];

  // Selected Variant Item payload for Cart & Wishlist
  const cartProductPayload = {
    ...product,
    variant_id: activeVariant.id,
    selectedVariant: activeVariant,
    price: activeVariant.price,
    discountPrice: activeVariant.comparePrice,
    sku: activeVariant.sku,
    images: galleryImages,
    stock: activeStock,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">
      {/* Left Column: Variant Image Switcher Gallery with Zoom */}
      <div className="lg:sticky lg:top-24">
        <ProductGallery
          images={galleryImages}
          isStock={isStock}
          productName={name}
        />
      </div>

      {/* Right Column: Product Metadata, Variant Switcher & Actions */}
      <div className="space-y-6">
        {/* Category & Title Section */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-block text-xs font-bold text-shop-orange uppercase tracking-wider bg-shop-orange/10 px-3 py-1 rounded-full">
              {categories}
            </span>
            <Badge variant="outline" className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              SKU: {activeVariant.sku}
            </Badge>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-shop-dark dark:text-slate-100 leading-tight">
            {name}
          </h1>

          {/* Brand & Reviews */}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
            <span className="text-slate-500 font-medium">
              Brand: <strong className="text-slate-900 dark:text-slate-200">{brand}</strong>
            </span>

            <div className="flex items-center gap-1.5">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="text-slate-500 font-medium ml-1">
                ({product.reviewsCount || 48} Customer Reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Variant Switcher Component */}
        <VariantSelector
          variants={variants}
          activeSku={activeVariant.sku}
          onSelectVariant={setActiveVariant}
        />

        {/* Live Dynamic Price & Stock Display Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4.5 bg-slate-50 dark:bg-slate-900/70 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <PriceDisplay
            price={activeVariant.price}
            priceCents={activeVariant.price_cents}
            comparePrice={activeVariant.comparePrice}
            comparePriceCents={activeVariant.compare_at_price_cents}
            showTaxNotice={true}
            size="lg"
          />

          <div>
            {isStock ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                In Stock ({activeStock} units)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800">
                Out of Stock
              </span>
            )}
          </div>
        </div>

        {/* Product Description */}
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {description}
        </p>

        {/* Main Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <div className="flex-1">
            <AddToCartButton product={cartProductPayload} className="h-12 text-sm font-bold shadow-md" />
          </div>
          <div className="shrink-0">
            <AddToWishlistButton product={cartProductPayload} />
          </div>
        </div>

        {/* Package Specifications Strip */}
        {(activeVariant.weight_grams || activeVariant.dimensions_mm_l_w_h) && (
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
            <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-1.5">
              <Package className="w-4 h-4 text-emerald-600" />
              <span>Packaging & Dimensions:</span>
            </span>
            {activeVariant.dimensions_mm_l_w_h && (
              <p className="text-slate-600 dark:text-slate-400">
                <strong>Dimensions (L x W x H):</strong> {activeVariant.dimensions_mm_l_w_h}
              </p>
            )}
            {activeVariant.weight_grams && (
              <p className="text-slate-600 dark:text-slate-400">
                <strong>Unit Weight:</strong>{" "}
                {activeVariant.weight_grams >= 1000
                  ? `${(activeVariant.weight_grams / 1000).toFixed(2)} kg`
                  : `${activeVariant.weight_grams} g`}
              </p>
            )}
          </div>
        )}

        {/* Secondary Utilities Strip */}
        <div className="flex items-center justify-between py-3 border-y border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">
          <button
            type="button"
            className="flex items-center gap-1.5 hover:text-shop-orange transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="h-4 w-4" />
            <span>Compare Models</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 hover:text-shop-orange transition-colors cursor-pointer"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Ask a Question</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 hover:text-shop-orange transition-colors cursor-pointer"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>

        {/* Delivery & Return Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-shop-orange/10 text-shop-orange mt-0.5">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Express Delivery Across India
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                Standard delivery within 24–48 hours with live tracking.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-shop-orange/10 text-shop-orange mt-0.5">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                7-Day Replacement Policy
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                Hassle-free replacement for transit damage or technical faults.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Specifications Section */}
        <ProductSpecsTable
          specs={activeVariant.specs}
          brand={brand}
          category={categories}
          sku={activeVariant.sku}
        />
      </div>
    </div>
  );
}
