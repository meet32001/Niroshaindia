"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface CartIconProps {
  itemCount?: number;
}

export function CartIcon({ itemCount = 0 }: CartIconProps) {
  return (
    <Link
      href="/cart"
      className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
      aria-label="Shopping Cart"
    >
      <ShoppingBag className="h-5 w-5" />
      <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-shop-orange hover:bg-shop-orange text-white font-bold">
        {itemCount}
      </Badge>
    </Link>
  );
}
