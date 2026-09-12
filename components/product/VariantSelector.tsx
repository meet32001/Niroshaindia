"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Layers, CheckCircle2 } from "lucide-react";
import { formatINR } from "@/components/product/PriceDisplay";

export interface Variant {
  id: string | number;
  sku: string;
  name: string;
  price?: number;
  price_cents?: number;
  comparePrice?: number;
  compare_at_price_cents?: number;
  stock?: number;
  isStock?: boolean;
  images?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  specs?: Record<string, any>;
  weight_grams?: number | null;
  dimensions_mm_l_w_h?: string | null;
}

export interface VariantSelectorProps {
  variants: Variant[];
  activeSku: string;
  onSelectVariant: (variant: Variant) => void;
  className?: string;
}

export function VariantSelector({
  variants,
  activeSku,
  onSelectVariant,
  className,
}: VariantSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  if (!variants || variants.length <= 1) {
    return null;
  }

  const handleVariantClick = (variant: Variant) => {
    if (variant.sku === activeSku) return;

    // Immediately trigger local state update
    onSelectVariant(variant);

    // Shallow URL update using Next.js router with scroll: false
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sku", variant.sku);
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  };

  const activeVariant = variants.find((v) => v.sku === activeSku) || variants[0];

  return (
    <div
      className={cn(
        "space-y-3 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 transition-opacity",
        isPending && "opacity-80",
        className
      )}
    >
      {/* Selector Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-shop-orange/10 text-shop-orange flex items-center justify-center">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span>Select Edition / Configuration ({variants.length}):</span>
        </span>

        <span className="text-xs font-semibold text-shop-orange max-w-[200px] truncate text-right">
          {activeVariant.name}
        </span>
      </div>

      {/* Variant Pills Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {variants.map((v) => {
          const isSelected = v.sku === activeSku;
          const vPrice =
            v.price !== undefined
              ? v.price
              : v.price_cents !== undefined
              ? v.price_cents / 100
              : 0;

          const vStock = v.stock ?? 10;
          const isInStock = v.isStock ?? vStock > 0;

          return (
            <button
              key={v.id || v.sku}
              type="button"
              onClick={() => handleVariantClick(v)}
              className={cn(
                "p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-1.5 relative overflow-hidden group",
                isSelected
                  ? "border-shop-orange bg-orange-50/60 dark:bg-orange-950/40 text-shop-orange ring-2 ring-shop-orange/25 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
              )}
              aria-pressed={isSelected}
            >
              {/* Selected Check Indicator */}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 text-shop-orange">
                  <CheckCircle2 className="w-4 h-4 fill-shop-orange/20" />
                </div>
              )}

              {/* Variant Title & SKU */}
              <div className="pr-5">
                <p
                  className={cn(
                    "text-xs font-bold leading-snug line-clamp-2",
                    isSelected ? "text-slate-900 dark:text-slate-100" : "text-slate-800 dark:text-slate-200"
                  )}
                >
                  {v.name}
                </p>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                  SKU: {v.sku}
                </p>
              </div>

              {/* Price & Stock status */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                  {formatINR(vPrice)}
                </span>

                {!isInStock ? (
                  <span className="text-[10px] font-bold text-rose-500 uppercase">
                    Out of Stock
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    In Stock
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
