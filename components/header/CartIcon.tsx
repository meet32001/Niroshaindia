"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store";
import { useIsMounted } from "@/hooks/useIsMounted";

export interface CartIconProps {
  itemCount?: number;
}

export function CartIcon({ itemCount: propCount }: CartIconProps) {
  const { items } = useStore();
  const isMounted = useIsMounted();

  const totalCount = isMounted
    ? items.reduce((acc, item) => acc + item.quantity, 0)
    : propCount || 0;

  return (
    <Link
      href="/cart"
      className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200 cursor-pointer"
      aria-label="Shopping Cart"
    >
      <ShoppingBag className="h-5 w-5" />
      {totalCount > 0 && (
        <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 flex items-center justify-center text-[10px] bg-shop-orange hover:bg-amber-600 text-white font-extrabold rounded-full">
          {totalCount}
        </Badge>
      )}
    </Link>
  );
}
