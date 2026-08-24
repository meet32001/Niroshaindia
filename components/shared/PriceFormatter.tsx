import { cn } from "@/lib/utils";

export interface PriceFormatterProps {
  amount: number;
  originalAmount?: number;
  className?: string;
  priceClassName?: string;
  originalPriceClassName?: string;
  showOriginal?: boolean;
}

/**
 * PriceFormatter formats currency amounts using Indian Rupee (INR) localization rules (en-IN).
 */
export function PriceFormatter({
  amount,
  originalAmount,
  className,
  priceClassName,
  originalPriceClassName,
  showOriginal = true,
}: PriceFormatterProps) {
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

  const formattedOriginalPrice =
    originalAmount !== undefined
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(originalAmount)
      : null;

  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className={cn("font-bold text-slate-900 dark:text-white", priceClassName)}>
        {formattedPrice}
      </span>
      {showOriginal && formattedOriginalPrice && originalAmount! > amount && (
        <span className={cn("text-xs text-slate-400 line-through font-normal", originalPriceClassName)}>
          {formattedOriginalPrice}
        </span>
      )}
    </div>
  );
}
