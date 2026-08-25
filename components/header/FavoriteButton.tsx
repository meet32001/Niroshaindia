"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store";
import { useIsMounted } from "@/hooks/useIsMounted";

export interface FavoriteButtonProps {
  itemCount?: number;
}

export function FavoriteButton({ itemCount: propCount }: FavoriteButtonProps) {
  const { favoriteProduct } = useStore();
  const isMounted = useIsMounted();

  const totalCount = isMounted ? favoriteProduct.length : propCount || 0;

  return (
    <Link
      href="/wishlist"
      className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200 cursor-pointer"
      aria-label="Wishlist"
    >
      <Heart className="h-5 w-5" />
      {totalCount > 0 && (
        <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 flex items-center justify-center text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-full">
          {totalCount}
        </Badge>
      )}
    </Link>
  );
}
