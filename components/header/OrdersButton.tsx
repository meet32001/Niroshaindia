"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Package } from "lucide-react";
import { getMyOrders } from "@/sanity/lib/queries";
import { useIsMounted } from "@/hooks/useIsMounted";

export function OrdersButton() {
  const { isSignedIn, user } = useUser();
  const isMounted = useIsMounted();
  const [orderCount, setOrderCount] = useState<number>(0);

  useEffect(() => {
    async function fetchOrders() {
      if (isSignedIn && user?.id) {
        try {
          const orders = await getMyOrders(user.id);
          setOrderCount(orders.length);
        } catch {
          setOrderCount(0);
        }
      } else {
        setOrderCount(0);
      }
    }
    fetchOrders();
  }, [isSignedIn, user?.id]);

  if (!isMounted || !isSignedIn) {
    return null;
  }

  return (
    <Link
      href="/orders"
      className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-shop-orange transition-colors"
      title="My Orders"
    >
      <Package className="h-5 w-5" />
      {orderCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-shop-orange px-1 text-[10px] font-bold text-white shadow-xs">
          {orderCount}
        </span>
      )}
    </Link>
  );
}
