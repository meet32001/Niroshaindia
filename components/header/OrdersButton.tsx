"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Package } from "lucide-react";
import { getMyOrders } from "@/lib/db/products";
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
      className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200 cursor-pointer"
      title="My Orders"
    >
      <Package className="h-5 w-5" />
      {orderCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 flex items-center justify-center text-[10px] bg-emerald-600 text-white font-extrabold rounded-full">
          {orderCount}
        </span>
      )}
    </Link>
  );
}
