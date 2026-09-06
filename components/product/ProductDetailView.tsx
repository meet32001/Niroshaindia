"use client";

import { useState } from "react";
import { Star, ArrowLeftRight, HelpCircle, Share2, Truck, RotateCcw, Package, Layers } from "lucide-react";
import { ImageView } from "@/components/product/ImageView";
import { PriceView } from "@/components/product/PriceView";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { AddToWishlistButton } from "@/components/product/AddToWishlistButton";
import { ProductCharacteristics } from "@/components/product/ProductCharacteristics";
import { Badge } from "@/components/ui/badge";

export interface ProductDetailViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product: any;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  // Variants list
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variants = (product.variants || product.product_variants || []) as any[];

  // Active Selected Variant State (default to first variant)
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  const activeVariant = variants[selectedVariantIndex] || {
    id: product.id || "var-default",
    sku: "SKU-DEFAULT",
    name: "Default",
    price: product.price || 0,
    comparePrice: product.discountPrice || 0,
    stock: product.stock !== undefined ? product.stock : 10,
    isStock: (product.stock !== undefined ? product.stock : 10) > 0,
    images: product.images || [],
    specs: product.specs || {},
    weight_grams: null,
    dimensions_mm_l_w_h: null,
  };

  const name = product.name || product.title || "Electronics Product";
  const description = product.description || "High-performance electronics gadget with official manufacturer warranty.";
  const brand = typeof product.brand === "string" ? product.brand : product.brand?.title || "Nirosha";

  const categories = Array.isArray(product.categories)
    ? product.categories.join(", ")
    : typeof product.category === "string"
    ? product.category
    : product.productType || "Electronics";

  const isStock = activeVariant.isStock ?? activeVariant.stock > 0;
  const activeStock = activeVariant.stock ?? 10;

  // Active Images
  const galleryImages = activeVariant.images && activeVariant.images.length > 0
    ? activeVariant.images
    : product.images;

  // Selected Variant Item payload for Cart
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
      {/* Left Column: Variant Image Switcher Gallery */}
      <ImageView images={galleryImages} isStock={isStock} />

      {/* Right Column: Product Metadata & Variant Switcher */}
      <div className="space-y-6">
        {/* Category & Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-block text-xs font-bold text-shop-orange uppercase tracking-wider bg-shop-orange/10 px-3 py-1 rounded-full">
              {categories}
            </span>
            <Badge variant="outline" className="text-[11px] font-mono text-slate-500">
              SKU: {activeVariant.sku}
            </Badge>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-shop-dark dark:text-slate-100 leading-tight">
            {name}
          </h1>

          {/* Brand & Ratings */}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
            <span className="text-slate-500 font-medium">
              Brand: <strong className="text-slate-900 dark:text-slate-200">{brand}</strong>
            </span>

            <div className="flex items-center gap-1">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="text-slate-500 font-medium ml-1">
                ({product.reviewsCount || 42} Customer Reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Variant Switcher */}
        {variants.length > 1 && (
          <div className="space-y-2.5 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-shop-orange" />
                <span>Select Variant / Edition ({variants.length} Available):</span>
              </span>
              <span className="text-xs font-semibold text-shop-orange">
                {activeVariant.name}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {variants.map((v, idx) => {
                const isSelected = idx === selectedVariantIndex;
                const vStock = v.stock ?? 10;
                const vInStock = vStock > 0;

                return (
                  <button
                    key={v.id || idx}
                    type="button"
                    onClick={() => setSelectedVariantIndex(idx)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? "border-shop-orange bg-orange-50/40 dark:bg-orange-950/30 text-shop-orange font-bold ring-2 ring-shop-orange/20 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                    }`}
                  >
                    <span>{v.name}</span>
                    <span className="text-[10px] opacity-75 font-bold">
                      ₹{v.price.toLocaleString("en-IN")}
                    </span>
                    {!vInStock && (
                      <span className="text-[9px] text-rose-500 uppercase font-bold">(Out of stock)</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic Price View & Stock Badge */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <PriceView
            price={activeVariant.price}
            discount={activeVariant.comparePrice > activeVariant.price ? activeVariant.comparePrice : 0}
            className="text-xl md:text-2xl"
          />

          <div>
            {isStock ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                In Stock: {activeStock} units
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-red-700 bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800">
                Out of Stock
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {description}
        </p>

        {/* Main Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <div className="flex-1">
            <AddToCartButton product={cartProductPayload} className="h-11 text-sm shadow-md" />
          </div>
          <div className="shrink-0">
            <AddToWishlistButton product={cartProductPayload} />
          </div>
        </div>

        {/* Package Specifications Strip */}
        {(activeVariant.weight_grams || activeVariant.dimensions_mm_l_w_h) && (
          <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
            <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-1.5">
              <Package className="w-4 h-4 text-emerald-600" />
              <span>Package Specifications:</span>
            </span>
            {activeVariant.dimensions_mm_l_w_h && (
              <p className="text-slate-600 dark:text-slate-400">
                <strong>Dimensions (L x W x H):</strong> {activeVariant.dimensions_mm_l_w_h}
              </p>
            )}
            {activeVariant.weight_grams && (
              <p className="text-slate-600 dark:text-slate-400">
                <strong>Weight:</strong> {activeVariant.weight_grams >= 1000 ? `${(activeVariant.weight_grams / 1000).toFixed(2)} kg` : `${activeVariant.weight_grams} g`}
              </p>
            )}
          </div>
        )}

        {/* Secondary Utilities Strip */}
        <div className="flex items-center justify-between py-3 border-y border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">
          <button type="button" className="flex items-center gap-1.5 hover:text-shop-orange transition-colors cursor-pointer">
            <ArrowLeftRight className="h-4 w-4" />
            <span>Compare</span>
          </button>
          <button type="button" className="flex items-center gap-1.5 hover:text-shop-orange transition-colors cursor-pointer">
            <HelpCircle className="h-4 w-4" />
            <span>Ask a Question</span>
          </button>
          <button type="button" className="flex items-center gap-1.5 hover:text-shop-orange transition-colors cursor-pointer">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>

        {/* Delivery & Return Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-shop-orange/10 text-shop-orange mt-0.5">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Free Delivery Available
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                Enter postal code at checkout for express 24h delivery.
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
                Hassle-free replacement if damaged upon arrival.
              </p>
            </div>
          </div>
        </div>

        {/* Product Technical Specifications Accordion */}
        <ProductCharacteristics product={{ ...product, ...activeVariant, specs: activeVariant.specs || product.specs }} />
      </div>
    </div>
  );
}
