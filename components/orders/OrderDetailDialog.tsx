"use client";

import Image from "next/image";
import { format } from "date-fns";
import { Download, ExternalLink, Calendar, Mail, User, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PriceFormatter } from "@/components/shared/PriceFormatter";
import { urlFor } from "@/sanity/lib/image";

export interface OrderDetailDialogProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailDialog({ order, isOpen, onClose }: OrderDetailDialogProps) {
  if (!order) return null;

  const orderDateFormatted = order.orderDate
    ? format(new Date(order.orderDate), "dd MMM yyyy, hh:mm a")
    : "N/A";

  const getImageUrl = (img: unknown) => {
    if (!img) return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
    if (typeof img === "string") return img;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((img as any)?.asset) {
      try {
        return urlFor(img).url();
      } catch {
        return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
      }
    }
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
  };

  const invoiceUrl = order.invoice?.hosted_invoice_url || order.stripeCheckoutSessionId ? `https://checkout.stripe.com/receipts` : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-2xl">
        <DialogHeader className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <DialogTitle className="text-xl font-extrabold text-shop-dark dark:text-slate-100 flex items-center gap-2">
                <span>Order Details</span>
                <span className="font-mono text-xs font-bold text-shop-orange bg-shop-orange/10 px-2 py-0.5 rounded-md">
                  #{order.orderNumber}
                </span>
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>Placed on {orderDateFormatted}</span>
              </p>
            </div>

            <Badge
              className={`text-xs px-2.5 py-1 font-bold capitalize ${
                order.status === "paid" || order.status === "delivered"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 hover:bg-emerald-100"
                  : order.status === "shipped"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 hover:bg-blue-100"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 hover:bg-amber-100"
              }`}
            >
              {order.status || "paid"}
            </Badge>
          </div>
        </DialogHeader>

        {/* Customer & Shipping Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="space-y-1.5">
            <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block">
              Customer Information
            </span>
            <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
              <User className="h-3.5 w-3.5 text-shop-orange shrink-0" />
              <span>{order.customerName || "Customer"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{order.customerEmail || "N/A"}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block">
              Payment Details
            </span>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-mono">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Session: {order.stripeCheckoutSessionId || "Stripe Payment"}</span>
            </div>

            {invoiceUrl && (
              <a
                href={invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-shop-orange font-bold hover:underline pt-1 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Stripe Tax Invoice / Receipt</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Ordered Items ({order.products?.length || 0})
          </h3>

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {order.products?.map((item: any, idx: number) => {
              const product = item.product || {};
              const title = product.name || product.title || "Electronics Item";
              const price = product.price || 0;
              const quantity = item.quantity || 1;
              const lineTotal = price * quantity;
              const mainImg = Array.isArray(product.images) ? product.images[0] : product.image;
              const imgUrl = getImageUrl(mainImg);

              return (
                <div key={item._key || idx} className="p-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 overflow-hidden flex items-center justify-center p-1">
                      <Image
                        src={imgUrl}
                        alt={title}
                        fill
                        sizes="48px"
                        className="object-contain p-0.5"
                      />
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-shop-dark dark:text-slate-100 line-clamp-1">
                        {title}
                      </h4>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Qty: {quantity} × <PriceFormatter amount={price} />
                      </span>
                    </div>
                  </div>

                  <PriceFormatter amount={lineTotal} className="text-sm font-extrabold text-shop-orange shrink-0" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing Summary Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>Subtotal</span>
            <PriceFormatter amount={order.totalPrice} className="font-semibold text-slate-900 dark:text-slate-100" />
          </div>

          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>Shipping</span>
            <span className="text-emerald-600 font-bold uppercase text-[11px]">Free</span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-base font-extrabold text-shop-dark dark:text-slate-100">
            <span>Total Paid</span>
            <PriceFormatter amount={order.totalPrice} className="text-lg font-black text-shop-orange" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
