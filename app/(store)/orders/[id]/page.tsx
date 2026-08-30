"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getOrderById } from "@/actions/orders";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceFormatter } from "@/components/shared/PriceFormatter";
import { ArrowLeft, Package, Truck, MapPin, Calendar, Loader2 } from "lucide-react";
import Image from "next/image";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true);
      const res = await getOrderById(id);
      if (res.success && res.order) {
        setOrder(res.order);
      } else {
        setError(res.error || "Order not found");
      }
      setLoading(false);
    }
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <Container className="py-16 flex justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Order Not Found
        </h2>
        <p className="text-sm text-slate-500">{error || "Unable to locate this order."}</p>
        <Link href="/orders">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
            Back to Orders
          </Button>
        </Link>
      </Container>
    );
  }

  const shipping = (order.shipping_cents || 0) / 100;
  const tax = (order.tax_cents || 0) / 100;
  const discount = (order.discount_cents || 0) / 100;
  const total = (order.total_cents || 0) / 100;
  const subtotal = total - shipping - tax + discount;

  const shippingAddr =
    typeof order.shipping_address === "string"
      ? JSON.parse(order.shipping_address || "{}")
      : order.shipping_address || {};

  return (
    <Container className="py-8 space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <Link
          href="/orders"
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Order #{order.order_number || order.id.slice(0, 8)}
            </h1>
            <Badge className="bg-emerald-600 text-white">
              {order.status || "Processing"}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              Placed on{" "}
              {new Date(order.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Items List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-slate-200 dark:border-slate-800">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                <span>Items Ordered</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 divide-y">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {order.order_items?.map((item: any) => {
                const variant = item.product_variants || {};
                const product = variant.products || {};
                const image =
                  variant.product_images?.[0]?.image_url ||
                  "/images/product-placeholder.png";
                const unitPrice = (item.unit_price_cents || variant.price_cents || 0) / 100;
                const lineTotal = (item.total_price_cents || (unitPrice * 100 * item.quantity)) / 100;

                return (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-lg border bg-slate-50 overflow-hidden shrink-0">
                      <Image
                        src={image}
                        alt={variant.name || product.name || "Product image"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${product.slug || product.id || ""}`}
                        className="font-semibold text-sm text-slate-900 dark:text-slate-100 hover:text-emerald-600 line-clamp-1"
                      >
                        {variant.name || product.name || "Product"}
                      </Link>
                      {variant.sku && (
                        <p className="text-xs text-slate-400">SKU: {variant.sku}</p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        Qty: {item.quantity} × <PriceFormatter amount={unitPrice} />
                      </p>
                    </div>
                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      <PriceFormatter amount={lineTotal} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Tracking Summary */}
          <Card className="border border-slate-200 dark:border-slate-800">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                <span>Shipment & Tracking</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p className="flex justify-between">
                <span className="text-slate-500">Carrier:</span>
                <span className="font-semibold">{order.carrier || "Standard Delivery"}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500">Tracking Number:</span>
                <span className="font-mono font-semibold">{order.tracking_number || "TRK-" + order.id.slice(0, 10).toUpperCase()}</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          {/* Delivery Address */}
          <Card className="border border-slate-200 dark:border-slate-800">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>Delivery Address</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm text-slate-600 dark:text-slate-300 space-y-1">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {shippingAddr.full_name || shippingAddr.name || "Customer"}
              </p>
              <p>{shippingAddr.street_address || shippingAddr.address || "Address details saved with order"}</p>
              <p>
                {shippingAddr.city && `${shippingAddr.city}, `}
                {shippingAddr.state} {shippingAddr.postal_code}
              </p>
              {shippingAddr.country && <p>{shippingAddr.country}</p>}
              {shippingAddr.phone && <p className="text-xs text-slate-400">Phone: {shippingAddr.phone}</p>}
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card className="border border-slate-200 dark:border-slate-800">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-base font-bold">Order Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <PriceFormatter amount={subtotal} />
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Shipping</span>
                <span>{shipping === 0 ? "FREE" : <PriceFormatter amount={shipping} />}</span>
              </div>
              {tax > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Tax</span>
                  <PriceFormatter amount={tax} />
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-<PriceFormatter amount={discount} /></span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base border-t pt-3 text-slate-900 dark:text-slate-100">
                <span>Total Paid</span>
                <PriceFormatter amount={total} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
