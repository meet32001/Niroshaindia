"use client";

import React, { useMemo, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Check, Layers, Monitor, HardDrive, Cpu, AirVent, Sparkles } from "lucide-react";
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
        parsedAttributes: attrs,
        parsedColor: attrs.color,
        parsedStorage: attrs.storage,
        parsedRam: attrs.ram,
        parsedDisplaySize: attrs.displaySize,
        parsedCapacityOrTon: attrs.capacityOrTon,
        parsedGlassOrFinish: attrs.glassOrFinish,
      };
    });
  }, [variants]);

  // Extract available distinct attributes across variants
  const {
    availableColors,
    availableStorages,
    availableRams,
    availableDisplaySizes,
    availableCapacities,
    availableFinishes,
    hasStructuredAttributes,
  } = useMemo(() => {
    const colorSet = new Set<string>();
    const storageSet = new Set<string>();
    const ramSet = new Set<string>();
    const displaySizeSet = new Set<string>();
    const capacitySet = new Set<string>();
    const finishSet = new Set<string>();

    parsedVariants.forEach((v) => {
      if (v.parsedColor) colorSet.add(v.parsedColor);
      if (v.parsedStorage) storageSet.add(v.parsedStorage);
      if (v.parsedRam) ramSet.add(v.parsedRam);
      if (v.parsedDisplaySize) displaySizeSet.add(v.parsedDisplaySize);
      if (v.parsedCapacityOrTon) capacitySet.add(v.parsedCapacityOrTon);
      if (v.parsedGlassOrFinish) finishSet.add(v.parsedGlassOrFinish);
    });

    const colors = Array.from(colorSet);
    const storages = Array.from(storageSet).sort(
      (a, b) => getStorageInGB(a) - getStorageInGB(b)
    );
    const rams = Array.from(ramSet).sort((a, b) => {
      const numA = parseInt(a.replace(/[^0-9]/g, "") || "0", 10);
      const numB = parseInt(b.replace(/[^0-9]/g, "") || "0", 10);
      return numA - numB;
    });
    const displaySizes = Array.from(displaySizeSet).sort((a, b) => {
      const numA = parseFloat(a.replace(/[^0-9.]/g, "") || "0");
      const numB = parseFloat(b.replace(/[^0-9.]/g, "") || "0");
      return numA - numB;
    });
    const capacities = Array.from(capacitySet);
    const finishes = Array.from(finishSet);

    const hasStructured =
      colors.length > 0 ||
      storages.length > 0 ||
      rams.length > 0 ||
      displaySizes.length > 0 ||
      capacities.length > 0 ||
      finishes.length > 0;

    return {
      availableColors: colors,
      availableStorages: storages,
      availableRams: rams,
      availableDisplaySizes: displaySizes,
      availableCapacities: capacities,
      availableFinishes: finishes,
      hasStructuredAttributes: hasStructured,
    };
  }, [parsedVariants]);

  if (!variants || variants.length <= 1) {
    return null;
  }

  const activeVariant =
    parsedVariants.find((v) => v.sku === activeSku) || parsedVariants[0];

  const selectedColor = activeVariant.parsedColor;
  const selectedStorage = activeVariant.parsedStorage;
  const selectedRam = activeVariant.parsedRam;
  const selectedDisplaySize = activeVariant.parsedDisplaySize;
  const selectedCapacity = activeVariant.parsedCapacityOrTon;
  const selectedFinish = activeVariant.parsedGlassOrFinish;

  const selectVariantAndUpdateUrl = (targetVariant: Variant) => {
    if (targetVariant.sku === activeSku) return;

    onSelectVariant(targetVariant);

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sku", targetVariant.sku);
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  };

  /**
   * Intelligently selects the closest matching variant when an attribute changes.
   */
  const handleAttributeChange = (
    attributeKey: "color" | "storage" | "ram" | "displaySize" | "capacityOrTon" | "glassOrFinish",
    newValue: string
  ) => {
    // Current preferred state
    const desired = {
      color: selectedColor,
      storage: selectedStorage,
      ram: selectedRam,
      displaySize: selectedDisplaySize,
      capacityOrTon: selectedCapacity,
      glassOrFinish: selectedFinish,
      [attributeKey]: newValue,
    };

    // Filter to candidates that have this exact new attribute
    const candidates = parsedVariants.filter((v) => {
      switch (attributeKey) {
        case "color":
          return v.parsedColor === newValue;
        case "storage":
          return v.parsedStorage === newValue;
        case "ram":
          return v.parsedRam === newValue;
        case "displaySize":
          return v.parsedDisplaySize === newValue;
        case "capacityOrTon":
          return v.parsedCapacityOrTon === newValue;
        case "glassOrFinish":
          return v.parsedGlassOrFinish === newValue;
      }
    });

    if (candidates.length === 0) return;

    // Score candidates by how many other attributes match the current state
    const scored = candidates.map((candidate) => {
      let score = 0;
      if (candidate.parsedColor === desired.color) score += 3;
      if (candidate.parsedStorage === desired.storage) score += 3;
      if (candidate.parsedRam === desired.ram) score += 2;
      if (candidate.parsedDisplaySize === desired.displaySize) score += 2;
      if (candidate.parsedCapacityOrTon === desired.capacityOrTon) score += 2;
      if (candidate.parsedGlassOrFinish === desired.glassOrFinish) score += 1;
      return { candidate, score };
    });

    scored.sort((a, b) => b.score - a.score);
    selectVariantAndUpdateUrl(scored[0].candidate);
  };

  return (
    <div
      className={cn(
        "space-y-4 p-4.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 transition-opacity",
        isPending && "opacity-80",
        className
      )}
    >
      {/* 1. Display Size Selector Strip (Tablets, TVs, Laptops) */}
      {availableDisplaySizes.length > 1 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-shop-orange" />
              <span>
                Screen Size:{" "}
                <strong className="text-slate-900 dark:text-slate-100 font-bold">
                  {selectedDisplaySize || "Select Size"}
                </strong>
              </span>
            </span>
            <span className="text-[11px] text-slate-400">
              {availableDisplaySizes.length} Sizes
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {availableDisplaySizes.map((size) => {
              const isSelected = selectedDisplaySize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleAttributeChange("displaySize", size)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs",
                    isSelected
                      ? "border-shop-orange bg-orange-50/80 dark:bg-orange-950/40 text-shop-orange ring-2 ring-shop-orange/30 font-bold"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                  aria-pressed={isSelected}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Color Swatch Selector Strip */}
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

              // Find variant for stock status
              const variantForColor = parsedVariants.find(
                (v) =>
                  v.parsedColor === color &&
                  v.parsedStorage === selectedStorage
              ) || parsedVariants.find((v) => v.parsedColor === color);

              const isInStock =
                variantForColor?.isStock ??
                (variantForColor?.stock ? variantForColor.stock > 0 : true);

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleAttributeChange("color", color)}
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

      {/* 3. Storage Capacity Selector Strip */}
      {availableStorages.length > 0 && (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-shop-orange" />
              <span>
                Storage:{" "}
                <strong className="text-slate-900 dark:text-slate-100 font-bold">
                  {selectedStorage || "Select Storage"}
                </strong>
              </span>
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
                  (v) =>
                    v.parsedStorage === storage &&
                    v.parsedColor === selectedColor
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
                  onClick={() => handleAttributeChange("storage", storage)}
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

      {/* 4. RAM / Memory Selector Strip */}
      {availableRams.length > 1 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-shop-orange" />
              <span>
                Memory / RAM:{" "}
                <strong className="text-slate-900 dark:text-slate-100 font-bold">
                  {selectedRam || "Select RAM"}
                </strong>
              </span>
            </span>
            <span className="text-[11px] text-slate-400">
              {availableRams.length} Options
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {availableRams.map((ram) => {
              const isSelected = selectedRam === ram;
              return (
                <button
                  key={ram}
                  type="button"
                  onClick={() => handleAttributeChange("ram", ram)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs",
                    isSelected
                      ? "border-shop-orange bg-orange-50/80 dark:bg-orange-950/40 text-shop-orange ring-2 ring-shop-orange/30 font-bold"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                  aria-pressed={isSelected}
                >
                  {ram}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Capacity / Tonnage Strip (Air Conditioners, Appliances, Washing Machines) */}
      {availableCapacities.length > 1 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <AirVent className="w-3.5 h-3.5 text-shop-orange" />
              <span>
                Capacity / Tonnage:{" "}
                <strong className="text-slate-900 dark:text-slate-100 font-bold">
                  {selectedCapacity || "Select Capacity"}
                </strong>
              </span>
            </span>
            <span className="text-[11px] text-slate-400">
              {availableCapacities.length} Sizes
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {availableCapacities.map((cap) => {
              const isSelected = selectedCapacity === cap;
              return (
                <button
                  key={cap}
                  type="button"
                  onClick={() => handleAttributeChange("capacityOrTon", cap)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs",
                    isSelected
                      ? "border-shop-orange bg-orange-50/80 dark:bg-orange-950/40 text-shop-orange ring-2 ring-shop-orange/30 font-bold"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                  aria-pressed={isSelected}
                >
                  {cap}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Special Glass / Tech Finish Strip */}
      {availableFinishes.length > 1 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-shop-orange" />
              <span>
                Glass & Finish:{" "}
                <strong className="text-slate-900 dark:text-slate-100 font-bold">
                  {selectedFinish || "Select Finish"}
                </strong>
              </span>
            </span>
            <span className="text-[11px] text-slate-400">
              {availableFinishes.length} Finishes
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {availableFinishes.map((finish) => {
              const isSelected = selectedFinish === finish;
              return (
                <button
                  key={finish}
                  type="button"
                  onClick={() => handleAttributeChange("glassOrFinish", finish)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs",
                    isSelected
                      ? "border-shop-orange bg-orange-50/80 dark:bg-orange-950/40 text-shop-orange ring-2 ring-shop-orange/30 font-bold"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                  aria-pressed={isSelected}
                >
                  {finish}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. Fallback: Generic Options List (for unclassified multi-variants) */}
      {!hasStructuredAttributes && (
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
