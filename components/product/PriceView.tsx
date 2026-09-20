import { PriceFormatter } from "@/components/shared/PriceFormatter";
import { cn } from "@/lib/utils";

export interface PriceViewProps {
  price?: number;
  discount?: number;
  isFrom?: boolean;
  className?: string;
}

export function PriceView({ price = 0, discount = 0, isFrom = false, className }: PriceViewProps) {
  // If discount is greater than price, it is an absolute compare-at / strikethrough price (e.g. 89900)
  // Otherwise if discount is between 0 and 100, treat it as a percentage discount
  const strikethroughPrice =
    discount > price
      ? discount
      : discount > 0 && discount < 100
      ? price + price * (discount / 100)
      : 0;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {isFrom && (
        <span className="text-[11px] md:text-xs font-semibold text-slate-500 dark:text-slate-400">
          From
        </span>
      )}
      <PriceFormatter
        amount={price}
        className="text-shop-dark dark:text-white font-bold text-sm md:text-base"
      />
      {strikethroughPrice > price && (
        <PriceFormatter
          amount={strikethroughPrice}
          className="line-through text-xs text-slate-400 font-normal ml-1"
        />
      )}
    </div>
  );
}
