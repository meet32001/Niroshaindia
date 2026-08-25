"use client";

import { ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { useStore } from "@/store";
import { QuantityButtons } from "@/components/product/QuantityButtons";
import { PriceFormatter } from "@/components/shared/PriceFormatter";
import { cn } from "@/lib/utils";

export interface AddToCartButtonProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product: any;
  className?: string;
}

export function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const { addItem, getItemCount } = useStore();

  const id = String(product?._id || product?.id || "");
  const itemCount = getItemCount(id);
  const isOutOfStock = product?.stock !== undefined && product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error("Product is currently out of stock");
      return;
    }
    addItem(product);
    const title = product?.name || product?.title || "Product";
    toast.success(`${title.slice(0, 18)}... added to cart`);
  };

  if (itemCount > 0) {
    const price = product?.price || 0;
    const itemSubtotal = price * itemCount;

    return (
      <div className="flex items-center justify-between gap-2 w-full">
        <QuantityButtons product={product} className={className} />
        <div className="flex flex-col text-right">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Subtotal
          </span>
          <PriceFormatter amount={itemSubtotal} className="text-xs font-bold text-shop-orange" />
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isOutOfStock}
      className={cn(
        "w-full bg-shop-orange hover:bg-amber-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-lg text-xs md:text-sm flex items-center justify-center gap-1.5 transition-all duration-300 shadow-xs cursor-pointer",
        className
      )}
    >
      <ShoppingBag className="h-4 w-4" />
      <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
    </button>
  );
}
