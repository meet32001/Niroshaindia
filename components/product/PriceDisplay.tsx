import React from "react";
import { cn } from "@/lib/utils";
import { Tag } from "lucide-react";

export interface PriceDisplayProps {
  /** Price in paise (e.g. 8270800) or in rupees (e.g. 82708) */
  price?: number;
  priceCents?: number;
  /** Compare at price / MRP in paise or rupees */
  comparePrice?: number;
  comparePriceCents?: number;
  className?: string;
  showBadge?: boolean;
  showTaxNotice?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export function formatINR(rupees: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function PriceDisplay({
  price,
  priceCents,
  comparePrice,
  comparePriceCents,
  className,
  showBadge = true,
  showTaxNotice = false,
  size = "lg",
}: PriceDisplayProps) {
  // Normalize paise to rupees
  const effectivePrice =
    priceCents !== undefined ? priceCents / 100 : price !== undefined ? price : 0;

  const effectiveComparePrice =
    comparePriceCents !== undefined
      ? comparePriceCents / 100
      : comparePrice !== undefined
      ? comparePrice
      : 0;

  const hasDiscount = effectiveComparePrice > effectivePrice;
  const discountPercent = hasDiscount
    ? Math.round(((effectiveComparePrice - effectivePrice) / effectiveComparePrice) * 100)
    : 0;
  const savings = hasDiscount ? effectiveComparePrice - effectivePrice : 0;

  const sizeClasses = {
    sm: "text-base font-bold",
    md: "text-lg md:text-xl font-bold",
    lg: "text-2xl md:text-3xl font-extrabold",
    xl: "text-3xl md:text-4xl font-black",
  }[size];

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex flex-wrap items-baseline gap-2.5">
        {/* Active Selling Price */}
        <span className={cn("text-shop-dark dark:text-slate-100 tracking-tight", sizeClasses)}>
          {formatINR(effectivePrice)}
        </span>

        {/* Strikethrough Original MRP */}
        {hasDiscount && (
          <span className="text-sm md:text-base text-slate-400 dark:text-slate-500 line-through font-medium">
            {formatINR(effectiveComparePrice)}
          </span>
        )}

        {/* Dynamic Discount Badge */}
        {hasDiscount && showBadge && discountPercent > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300/60 dark:border-emerald-800">
            <Tag className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{discountPercent}% OFF</span>
          </span>
        )}
      </div>

      {/* Savings & Taxes Notice */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        {hasDiscount && savings > 0 && (
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            You save {formatINR(savings)}
          </span>
        )}
        {showTaxNotice && (
          <span>(Inclusive of all taxes)</span>
        )}
      </div>
    </div>
  );
}
