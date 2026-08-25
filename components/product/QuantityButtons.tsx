"use client";

import toast from "react-hot-toast";
import { Plus, Minus } from "lucide-react";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";

export interface QuantityButtonsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product: any;
  className?: string;
}

export function QuantityButtons({ product, className }: QuantityButtonsProps) {
  const { addItem, removeItem, getItemCount } = useStore();

  const id = String(product?._id || product?.id || "");
  const itemCount = getItemCount(id);
  const maxStock = product?.stock !== undefined ? product.stock : 10;

  const handleIncrement = () => {
    if (itemCount >= maxStock) {
      toast.error("Cannot add more than available stock");
      return;
    }
    addItem(product);
    toast.success("Quantity updated");
  };

  const handleDecrement = () => {
    if (itemCount > 0) {
      removeItem(id);
      toast.success("Item removed from cart");
    }
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-between border border-slate-200 dark:border-slate-800 rounded-lg p-1 bg-slate-50 dark:bg-slate-900 gap-2",
        className
      )}
    >
      <button
        onClick={handleDecrement}
        className="h-7 w-7 rounded-md bg-white dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      <span className="text-xs font-extrabold text-shop-dark dark:text-slate-100 min-w-[20px] text-center">
        {itemCount}
      </span>

      <button
        onClick={handleIncrement}
        className="h-7 w-7 rounded-md bg-shop-orange flex items-center justify-center text-white hover:bg-amber-600 transition-colors shadow-xs cursor-pointer"
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
