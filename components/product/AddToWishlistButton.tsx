"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AddToWishlistButton({ product }: { product?: any }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    if (product) {
      console.log("Toggled wishlist for product:", product.name || product.title);
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      aria-label="Add to Wishlist"
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200/80 dark:border-slate-800 transition-all duration-300 hover:scale-110 hover:text-rose-500 cursor-pointer",
        isWishlisted && "text-rose-500 fill-rose-500 bg-rose-50 border-rose-200"
      )}
    >
      <Heart className={cn("h-4 w-4", isWishlisted && "fill-rose-500")} />
    </button>
  );
}
