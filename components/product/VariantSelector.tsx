"use client";

import React, { useMemo, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Check, Layers } from "lucide-react";
import { formatINR } from "@/components/product/PriceDisplay";
import {
  parseVariantAttributes,
  getStorageInGB,
  getColorSwatch,
} from "@/lib/utils/variants";

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

  // Parse all variants with structured attributes
  const parsedVariants = useMemo(() => {
    return variants.map((v) => {
      const attrs = parseVariantAttributes(v.name, v.specs);
      return {
        ...v,
        parsedColor: attrs.color,
        parsedStorage: attrs.storage,
      };
    });
  }, [variants]);

  // Extract available distinct colors and storages
  const { availableColors, availableStorages, hasMultiAttributes } = useMemo(() => {
    const colorSet = new Set<string>();
    const storageSet = new Set<string>();

    parsedVariants.forEach((v) => {
      if (v.parsedColor) colorSet.add(v.parsedColor);
      if (v.parsedStorage) storageSet.add(v.parsedStorage);
    });

    const colors = Array.from(colorSet);
    const storages = Array.from(storageSet).sort(
      (a, b) => getStorageInGB(a) - getStorageInGB(b)
    );

    return {
      availableColors: colors,
      availableStorages: storages,
      hasMultiAttributes: colors.length > 0 || storages.length > 0,
    };
  }, [parsedVariants]);

  if (!variants || variants.length <= 1) {
    return null;
  }

  const activeVariant =
    parsedVariants.find((v) => v.sku === activeSku) || parsedVariants[0];

  const selectedColor =
    activeVariant.parsedColor || (availableColors.length > 0 ? availableColors[0] : undefined);
  const selectedStorage =
    activeVariant.parsedStorage || (availableStorages.length > 0 ? availableStorages[0] : undefined);

  const selectVariantAndUpdateUrl = (targetVariant: Variant) => {
    if (targetVariant.sku === activeSku) return;

    onSelectVariant(targetVariant);

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sku", targetVariant.sku);
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  };

  const handleColorChange = (color: string) => {
    // 1. Try to find variant with current storage + new color
    let match = parsedVariants.find(
      (v) => v.parsedColor === color && v.parsedStorage === selectedStorage
    );

    // 2. Fallback to first variant of this color
    if (!match) {
      match = parsedVariants.find((v) => v.parsedColor === color);
    }

    if (match) {
      selectVariantAndUpdateUrl(match);
    }
  };

  const handleStorageChange = (storage: string) => {
    // 1. Try to find variant with current color + new storage
    let match = parsedVariants.find(
      (v) => v.parsedStorage === storage && v.parsedColor === selectedColor
    );

    // 2. Fallback to first variant of this storage
    if (!match) {
      match = parsedVariants.find((v) => v.parsedStorage === storage);
    }

    if (match) {
      selectVariantAndUpdateUrl(match);
    }
  };

  return (
    <div
      className={cn(
        "space-y-4 p-4.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 transition-opacity",
        isPending && "opacity-80",
        className
      )}
    >
      {/* 1. Color Selector Section */}
      {availableColors.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400">
              Color:{" "}
              <strong className="text-slate-900 dark:text-slate-100 font-bold">
                {selectedColor || "Select Color"}
              </strong>
            </span>
            <span className="text-[11px] text-slate-400">
              {availableColors.length} {availableColors.length === 1 ? "Option" : "Options"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {availableColors.map((color) => {
              const isSelected = selectedColor === color;
              const swatch = getColorSwatch(color);

              // Find if this color is available for current storage
              const variantForColor = parsedVariants.find(
                (v) => v.parsedColor === color && v.parsedStorage === selectedStorage
              ) || parsedVariants.find((v) => v.parsedColor === color);

              const isInStock = variantForColor?.isStock ?? (variantForColor?.stock ? variantForColor.stock > 0 : true);

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorChange(color)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs",
                    isSelected
                      ? "border-shop-orange bg-orange-50/70 dark:bg-orange-950/40 text-shop-orange ring-2 ring-shop-orange/30 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700",
                    !isInStock && "opacity-50 line-through"
                  )}
                  aria-pressed={isSelected}
                  title={color}
                >
                  {/* Swatch color bubble */}
                  <span
                    className={cn(
                      "h-4 w-4 rounded-full shrink-0 flex items-center justify-center border shadow-2xs",
                      swatch.isLight ? "border-slate-300" : "border-slate-800"
                    )}
                    style={{ backgroundColor: swatch.bg }}
                  >
                    {isSelected && (
                      <Check
                        className={cn(
                          "h-2.5 w-2.5",
                          swatch.isLight ? "text-slate-900" : "text-white"
                        )}
                        strokeWidth={3}
                      />
                    )}
                  </span>
                  <span>{color}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Storage Capacity Selector Section */}
      {availableStorages.length > 0 && (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400">
              Storage:{" "}
              <strong className="text-slate-900 dark:text-slate-100 font-bold">
                {selectedStorage || "Select Storage"}
              </strong>
            </span>
            <span className="text-[11px] text-slate-400">
              {availableStorages.length} Capacities
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {availableStorages.map((storage) => {
              const isSelected = selectedStorage === storage;

              // Find price for this storage in currently selected color
              const matchVariant =
                parsedVariants.find(
                  (v) => v.parsedStorage === storage && v.parsedColor === selectedColor
                ) || parsedVariants.find((v) => v.parsedStorage === storage);

              const priceNum =
                matchVariant?.price !== undefined
                  ? matchVariant.price
                  : matchVariant?.price_cents
                  ? matchVariant.price_cents / 100
                  : undefined;

              return (
                <button
                  key={storage}
                  type="button"
                  onClick={() => handleStorageChange(storage)}
                  className={cn(
                    "py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5",
                    isSelected
                      ? "border-shop-orange bg-orange-50/80 dark:bg-orange-950/40 text-shop-orange ring-2 ring-shop-orange/30 shadow-xs font-bold"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 font-semibold"
                  )}
                  aria-pressed={isSelected}
                >
                  <span className="text-xs md:text-sm">{storage}</span>
                  {priceNum !== undefined && (
                    <span
                      className={cn(
                        "text-[10px]",
                        isSelected
                          ? "text-shop-orange/90 font-bold"
                          : "text-slate-400 font-normal"
                      )}
                    >
                      {formatINR(priceNum)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Fallback: Generic Options List (for non-storage/non-color products) */}
      {!hasMultiAttributes && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-shop-orange/10 text-shop-orange flex items-center justify-center">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <span>Select Edition ({variants.length}):</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {variants.map((v) => {
              const isSelected = v.sku === activeSku;
              const vPrice =
                v.price !== undefined
                  ? v.price
                  : v.price_cents !== undefined
                  ? v.price_cents / 100
                  : 0;

              return (
                <button
                  key={v.id || v.sku}
                  type="button"
                  onClick={() => selectVariantAndUpdateUrl(v)}
                  className={cn(
                    "p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-1.5",
                    isSelected
                      ? "border-shop-orange bg-orange-50/60 dark:bg-orange-950/40 text-shop-orange ring-2 ring-shop-orange/25 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  <span className="text-xs font-bold">{v.name}</span>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                    {formatINR(vPrice)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
