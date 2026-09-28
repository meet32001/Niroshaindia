"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Package,
  Loader2,
  Search,
  X,
  ShoppingBag,
  Filter,
} from "lucide-react";
import { getCustomerOrdersAction, type EnrichedOrder } from "@/actions/orders";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderCard } from "@/components/orders/OrderCard";

type FilterTab = "all" | "active" | "delivered" | "cancelled";

export default function OrdersPage() {
  const [orders, setOrders] = useState<EnrichedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isMounted = true;
    getCustomerOrdersAction().then((res) => {
      if (!isMounted) return;
      if (res.success && Array.isArray(res.orders)) {
        setOrders(res.orders);
      }
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute status counts
  const counts = useMemo(() => {
    let active = 0;
    let delivered = 0;
    let cancelled = 0;

    orders.forEach((o) => {
      const s = o.status?.toLowerCase();
      if (s === "delivered" || s === "completed") {
        delivered++;
      } else if (s === "cancelled") {
        cancelled++;
      } else {
        // pending, processing, shipped
        active++;
      }
    });

    return {
      all: orders.length,
      active,
      delivered,
      cancelled,
    };
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Tab filter
      const s = order.status?.toLowerCase();
      if (activeTab === "active") {
        if (s === "delivered" || s === "completed" || s === "cancelled") return false;
      } else if (activeTab === "delivered") {
        if (s !== "delivered" && s !== "completed") return false;
      } else if (activeTab === "cancelled") {
        if (s !== "cancelled") return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesOrderNumber = order.order_number.toLowerCase().includes(query);
        const matchesItemTitle = order.items.some((item) =>
          item.title.toLowerCase().includes(query)
        );
        const matchesRecipient =
          order.shipping_address_snapshot?.recipient_name?.toLowerCase().includes(query) || false;

        return matchesOrderNumber || matchesItemTitle || matchesRecipient;
      }

      return true;
    });
  }, [orders, activeTab, searchQuery]);

  return (
    <div className="bg-slate-50/50 dark:bg-slate-950 min-h-screen pb-20">
      <Container className="py-8 space-y-6">
        {/* Page Title & Overview */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
              <Package className="w-7 h-7 text-shop-orange" />
              <span>Order History & Tracking</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Track live consignments, view detailed invoices, and manage past electronics purchases.
            </p>
          </div>

          <Link href="/shop">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl font-bold text-xs gap-1.5 border-slate-200 dark:border-slate-800 hover:border-shop-orange self-start sm:self-auto"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Explore Store</span>
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-shop-orange animate-spin" />
            <span className="text-xs font-semibold text-slate-500">
              Retrieving your verified purchase records...
            </span>
          </div>
        ) : orders.length === 0 ? (
          /* Empty State: Zero Total Orders */
          <Card className="p-12 sm:p-16 text-center border-dashed rounded-3xl space-y-4 max-w-lg mx-auto bg-white dark:bg-slate-900">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-shop-orange flex items-center justify-center mx-auto">
              <Package className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                No orders placed yet
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                Explore our premium electronics, verified Indian warranties, and exclusive weekly drops.
              </p>
            </div>
            <Link href="/shop" className="inline-block pt-2">
              <Button className="bg-shop-orange hover:bg-amber-600 text-white font-bold rounded-xl text-xs px-6 shadow-xs">
                Explore Store
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Search Bar & Filter Tabs Controls */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeTab === "all"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  All Orders ({counts.all})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("active")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeTab === "active"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  Active / In Transit ({counts.active})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("delivered")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeTab === "delivered"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  Delivered ({counts.delivered})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("cancelled")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeTab === "cancelled"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  Cancelled ({counts.cancelled})
                </button>
              </div>

              {/* Search Past Orders Input */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search order # or product..."
                  className="pl-9 pr-8 rounded-xl text-xs h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Orders Feed */}
            {filteredOrders.length === 0 ? (
              /* Empty State: Zero Matching Filters */
              <Card className="p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Filter className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    No matching orders found
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    {searchQuery
                      ? `No orders matching "${searchQuery}" in ${activeTab} category.`
                      : `You have no ${activeTab} orders at this moment.`}
                  </p>
                </div>
                {(activeTab !== "all" || searchQuery) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveTab("all");
                      setSearchQuery("");
                    }}
                    className="rounded-xl text-xs font-semibold"
                  >
                    Reset Filters
                  </Button>
                )}
              </Card>
            ) : (
              <div className="space-y-5">
                {filteredOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
