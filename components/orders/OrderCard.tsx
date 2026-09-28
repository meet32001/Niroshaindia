"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  ArrowRight,
  Check,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceFormatter } from "@/components/shared/PriceFormatter";
import { useStore } from "@/store";
import type { EnrichedOrder, EnrichedOrderItem } from "@/actions/orders";

interface OrderCardProps {
  order: EnrichedOrder;
}

/**
 * Standardizes order numbers to #NIR-ORD-... format
 */
function formatDisplayOrderNumber(raw: string): string {
  if (!raw) return "#NIR-ORD-2026-00000";
  if (raw.startsWith("#")) return raw;
  if (raw.startsWith("ORD-")) return raw.replace(/^ORD-/, "#NIR-ORD-2026-");
  if (raw.startsWith("NIR-ORD-")) return `#${raw}`;
  return `#${raw}`;
}

/**
 * Cleans long variant names into concise specification tokens
 */
function extractVariantSpecs(variantName: string | null): string | null {
  if (!variantName) return null;

  // Check if enclosed in parentheses: (Intel Core i5/ 16GB RAM/ ...)
  const parenMatch = variantName.match(/\(([^)]+)\)/);
  if (parenMatch && parenMatch[1]) {
    const rawParts = parenMatch[1].split(/[/,•]/).map((s) => s.trim()).filter(Boolean);
    if (rawParts.length > 0) {
      return rawParts.slice(0, 3).join(" • ");
    }
  }

  // If contains delimiter like - or /
  if (variantName.includes("/")) {
    return variantName.split("/").map((s) => s.trim()).slice(0, 3).join(" • ");
  }

  return variantName.length > 40 ? `${variantName.slice(0, 37)}...` : variantName;
}

export function OrderCard({ order }: OrderCardProps) {
  const { addItem } = useStore();

  const formattedDate = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const displayOrderNumber = formatDisplayOrderNumber(order.order_number);
  const address = order.shipping_address_snapshot;
  const recipientName = address?.recipient_name || "Valued Customer";
  const destination = address?.city && address?.state ? `${address.city}, ${address.state}` : address?.country || "India";

  // Stepper logic
  const stages = [
    { key: "confirmed", label: "Confirmed" },
    { key: "processing", label: "Processing" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
  ];

  let currentStageIndex = 1; // Default to Processing
  switch (order.status?.toLowerCase()) {
    case "pending":
      currentStageIndex = 0;
      break;
    case "processing":
      currentStageIndex = 1;
      break;
    case "shipped":
      currentStageIndex = 2;
      break;
    case "delivered":
    case "completed":
      currentStageIndex = 3;
      break;
    case "cancelled":
      currentStageIndex = -1;
      break;
    default:
      currentStageIndex = 1;
  }

  const isCancelled = order.status?.toLowerCase() === "cancelled";

  // Logistics dynamic copy
  let logisticsText = "Preparing your package for dispatch at our fulfillment center.";
  if (order.status === "shipped") {
    const carrier = address?.carrier || "Blue Dart Express";
    const awb = address?.tracking_number || "BLUEDART-IND-90283419";
    logisticsText = `Shipped via ${carrier} • AWB: ${awb}`;
  } else if (order.status === "delivered" || order.status === "completed") {
    logisticsText = "Package successfully delivered to destination address.";
  } else if (order.status === "pending") {
    logisticsText = "Order confirmed. Awaiting warehouse allocation.";
  }

  const handleBuyAgain = (item: EnrichedOrderItem) => {
    addItem({
      id: item.variant_id || item.id,
      name: item.title,
      price: item.unit_price_cents / 100,
      images: [item.image_url],
      slug: item.slug,
    });
    toast.success(`Added ${item.title.slice(0, 24)}... to bag!`);
  };

  return (
    <Card className="rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900">
      {/* 1. Order Header Bar (Scannable Metadata) */}
      <div className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 p-4 sm:p-5">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
          {/* Order Placed */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Order Placed
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              {formattedDate}
            </span>
          </div>

          {/* Total */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Total
            </span>
            <PriceFormatter
              amount={order.total_amount_cents / 100}
              className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Ship To */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Ship To
            </span>
            <div className="group relative inline-block cursor-default">
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate block">
                {recipientName}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                {destination}
              </span>
            </div>
          </div>

          {/* Order # */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Order #
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-shop-orange tracking-tight block">
              {displayOrderNumber}
            </span>
          </div>

          {/* Status Badge */}
          <div className="col-span-2 md:col-span-1 flex md:justify-end items-center">
            {order.status === "processing" && (
              <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 font-bold px-3 py-1 text-xs gap-1.5 rounded-full shadow-2xs">
                <Clock className="w-3.5 h-3.5" />
                <span>Processing</span>
              </Badge>
            )}
            {order.status === "shipped" && (
              <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 font-bold px-3 py-1 text-xs gap-1.5 rounded-full shadow-2xs">
                <Truck className="w-3.5 h-3.5" />
                <span>In Transit</span>
              </Badge>
            )}
            {(order.status === "delivered" || order.status === "completed") && (
              <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 font-bold px-3 py-1 text-xs gap-1.5 rounded-full shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Delivered</span>
              </Badge>
            )}
            {order.status === "cancelled" && (
              <Badge className="bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 font-bold px-3 py-1 text-xs gap-1.5 rounded-full shadow-2xs">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Cancelled</span>
              </Badge>
            )}
            {order.status === "pending" && (
              <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 font-bold px-3 py-1 text-xs gap-1.5 rounded-full shadow-2xs">
                <Clock className="w-3.5 h-3.5" />
                <span>Pending</span>
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* 2. Visual Delivery Progress Stepper */}
      {!isCancelled ? (
        <div className="py-4 px-4 sm:px-6 bg-slate-50/40 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800">
          <div className="max-w-xl mx-auto">
            {/* Dots & Connecting Lines */}
            <div className="relative flex items-center justify-between">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-800 w-full z-0" />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-600 dark:bg-emerald-500 transition-all duration-500 z-0"
                style={{ width: `${(Math.max(0, currentStageIndex) / 3) * 100}%` }}
              />
              {stages.map((stage, idx) => {
                const isCompleted = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                const isReached = idx <= currentStageIndex;

                return (
                  <div key={stage.key} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                        isCompleted
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : isCurrent
                          ? "bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950/70 shadow-2xs"
                          : "bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-400"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span
                      className={`text-[10px] sm:text-[11px] font-bold mt-1.5 tracking-tight ${
                        isReached
                          ? "text-slate-900 dark:text-slate-100"
                          : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Logistics Status Sub-line */}
            <div className="mt-3.5 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-medium text-[11px] sm:text-xs">{logisticsText}</span>
              </div>

              {order.status === "shipped" && address?.tracking_number && (
                <a
                  href={`https://www.bluedart.com/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-shop-orange hover:underline"
                >
                  <span>Track Consignment</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {address?.estimated_delivery && (
                <span className="text-[11px] text-slate-500 font-medium">
                  Expected Delivery: <strong>{address.estimated_delivery}</strong>
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-3 px-5 bg-rose-50/50 dark:bg-rose-950/20 border-b border-rose-200/60 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>This order has been cancelled. Any processed payment has been refunded to your original payment method.</span>
        </div>
      )}

      {/* 3. Rich Line Items */}
      <div className="p-4 sm:p-6 divide-y divide-slate-100 dark:divide-slate-800">
        {order.items.map((item) => {
          const specsBadge = extractVariantSpecs(item.variant_name);

          return (
            <div
              key={item.id}
              className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 min-w-0 flex-1">
                {/* 80x80px Square Thumbnail */}
                <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 shrink-0 border border-slate-200/80 dark:border-slate-800 p-1 flex items-center justify-center">
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    className="object-contain p-1"
                  />
                </div>

                {/* Item Details */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-snug">
                    <Link
                      href={`/product/${item.slug}`}
                      className="hover:text-shop-orange transition-colors line-clamp-2"
                      title={item.title}
                    >
                      {item.title}
                    </Link>
                  </h4>

                  {/* Variant Specifications Badge */}
                  {specsBadge && (
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 truncate max-w-sm">
                        {specsBadge}
                      </span>
                    </div>
                  )}

                  {/* Warranty & In Stock Trust Badge */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] pt-0.5">
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{item.warranty_months ? `${item.warranty_months} Months` : "1 Year"} Brand Warranty Included</span>
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-slate-500 font-medium">
                      Qty: {item.quantity}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <PriceFormatter
                      amount={item.unit_price_cents / 100}
                      className="font-bold text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Item Actions */}
              <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleBuyAgain(item)}
                  className="rounded-xl text-xs font-bold gap-1.5 h-8 border-slate-200 dark:border-slate-700 hover:border-shop-orange hover:text-shop-orange transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Buy Again</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Card Footer Utilities */}
      <div className="p-4 sm:p-5 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Link
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1.5 transition-colors"
          href={`/contact?inquiry_type=order_tracking&order_number=${encodeURIComponent(order.order_number)}`}
        >
          <span>Need Help with this Order? Submit Inquiry</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {address?.address_line1 && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate max-w-xs sm:max-w-md">
              Delivering to: {address.address_line1}
              {address.city ? `, ${address.city}` : ""}
              {address.postal_code ? ` - ${address.postal_code}` : ""}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
