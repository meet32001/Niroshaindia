"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserOrders } from "@/actions/orders";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceFormatter } from "@/components/shared/PriceFormatter";
import { Package, ArrowRight, Loader2, Calendar } from "lucide-react";
import Image from "next/image";

export default function OrdersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getUserOrders().then((res) => {
      if (!isMounted) return;
      if (res.success) {
        setOrders(res.orders);
      }
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
      case "completed":
        return <Badge className="bg-emerald-600 text-white">Delivered</Badge>;
      case "processing":
      case "shipped":
        return <Badge className="bg-blue-600 text-white">Processing</Badge>;
      case "pending":
        return <Badge className="bg-amber-500 text-white">Pending</Badge>;
      case "cancelled":
        return <Badge className="bg-rose-600 text-white">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status || "Processing"}</Badge>;
    }
  };

  return (
    <Container className="py-8 space-y-6">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Order History
        </h1>
        <p className="text-sm text-slate-500">
          View your past orders, delivery status, and tracking information.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <Card className="p-12 text-center border-dashed space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">No orders found</h3>
            <p className="text-sm text-slate-500">
              You haven&apos;t placed any orders yet. Start exploring our shop!
            </p>
          </div>
          <Link href="/shop">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
              Browse Products
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const itemCount = order.order_items?.reduce(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (sum: number, item: any) => sum + (item.quantity || 1),
              0
            ) || 0;

            const total = (order.total_cents || 0) / 100;

            return (
              <Card
                key={order.id}
                className="border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow overflow-hidden"
              >
                <CardHeader className="bg-slate-50/50 dark:bg-slate-800/40 p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold">
                        Order #{order.order_number || order.id.slice(0, 8)}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <Link href={`/orders/${order.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl gap-1 font-semibold hover:text-emerald-600"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  {/* Thumbnails */}
                  <div className="flex items-center gap-3 overflow-x-auto pb-1">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {order.order_items?.slice(0, 4).map((item: any) => {
                      const image =
                        item.product_variants?.product_images?.[0]?.image_url ||
                        "/images/product-placeholder.png";

                      return (
                        <div
                          key={item.id}
                          className="relative w-14 h-14 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0 overflow-hidden"
                        >
                          <Image
                            src={image}
                            alt="Order item"
                            fill
                            className="object-cover"
                          />
                        </div>
                      );
                    })}
                    {order.order_items?.length > 4 && (
                      <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                        +{order.order_items.length - 4} more
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t text-sm">
                    <span className="text-slate-500">
                      {itemCount} {itemCount === 1 ? "item" : "items"}
                    </span>
                    <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-slate-100">
                      <span>Total:</span>
                      <PriceFormatter amount={total} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </Container>
  );
}
