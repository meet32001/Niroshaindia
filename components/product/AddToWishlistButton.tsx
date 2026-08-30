"use client";

import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import { useStore } from "@/store";
import { toggleWishlistItem } from "@/actions/wishlist";
import { cn } from "@/lib/utils";

export interface AddToWishlistButtonProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product: any;
  className?: string;
}

export function AddToWishlistButton({
  product,
  className,
}: AddToWishlistButtonProps) {
  const { favoriteProduct, addToFavorite } = useStore();

  const id = String(product?._id || product?.id || "");
  const variantId = String(
    product?.product_variants?.[0]?.id || product?.variant_id || ""
  );

  const isFavorite = favoriteProduct.some(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (item: any) => String(item._id || item.id || "") === id
  );

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic UI update in local Zustand store
    addToFavorite(product);

    if (isFavorite) {
      toast.success("Removed from wishlist");
    } else {
      toast.success("Added to wishlist");
    }

    // Server-side persistent sync
    try {
      await toggleWishlistItem(variantId || null, id || null);
    } catch (err) {
      console.warn("[WISHLIST SYNC NOTICE]:", err);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      className={cn(
        "p-2 rounded-full border transition-all duration-300 shadow-xs cursor-pointer",
        isFavorite
          ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-600"
          : "bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500 hover:border-rose-200",
        className
      )}
      aria-label="Add to Wishlist"
    >
      <Heart
        className={cn("h-4 w-4 transition-transform active:scale-125", isFavorite && "fill-rose-600 text-rose-600")}
      />
    </button>
  );
}
