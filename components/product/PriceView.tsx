import { PriceFormatter } from "@/components/shared/PriceFormatter";
import { cn } from "@/lib/utils";

export interface PriceViewProps {
  price?: number;
  discount?: number;
  className?: string;
}

export function PriceView({ price = 0, discount = 0, className }: PriceViewProps) {
  const originalPrice = discount > 0 ? price + (price * (discount / 100)) : 0;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <PriceFormatter
        amount={price}
        className="text-shop-dark dark:text-white font-bold text-sm md:text-base"
      />
      {discount > 0 && (
        <PriceFormatter
          amount={originalPrice}
          className="line-through text-xs text-slate-400 font-normal ml-1"
        />
      )}
    </div>
  );
}
