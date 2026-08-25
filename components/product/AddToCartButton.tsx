"use client";

import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AddToCartButtonProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product: any;
  className?: string;
}

export function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const isOutOfStock = product.stock === 0 || product.stockStatus === "out_of_stock";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      console.log("Added to cart:", product.name || product.title);
    }
  };

  if (isOutOfStock) {
    return (
      <button
        disabled
        className={cn(
          "w-full bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-800 rounded-md py-1.5 text-xs font-semibold cursor-not-allowed",
          className
        )}
      >
        Out of Stock
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      className={cn(
        "w-full bg-transparent border border-shop-orange text-shop-orange hover:bg-shop-orange hover:text-white rounded-md py-1.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors duration-300 cursor-pointer shadow-2xs",
        className
      )}
    >
      <ShoppingBag className="h-3.5 w-3.5" />
      <span>Add to Cart</span>
    </button>
  );
}
