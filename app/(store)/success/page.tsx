"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { CheckCircle2, ShoppingBag, ArrowRight, Package, MapPin, Loader2 } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { useStore } from "@/store";
import { getOrderSuccessDetails } from "@/actions/createCheckoutSession";

interface SuccessOrderData {
  orderNumber: string;
  totalAmountPaid: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  paymentStatus: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  address: any;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const paramOrderNumber = searchParams.get("order_number");

  const [orderDetails, setOrderDetails] = useState<SuccessOrderData | null>(null);
  const [loading, setLoading] = useState(Boolean(sessionId));

  const { resetCart } = useStore();

  useEffect(() => {
    // 1. Immediately reset client cart and purge persisted storage on reaching success page
    useStore.getState().resetCart();
    try {
      localStorage.removeItem("cart-store");
    } catch {
      // ignore in SSR / restricted storage environments
    }

    // 2. Fetch server-verified order details from Stripe session & guarantee DB persistence
    if (sessionId) {
      getOrderSuccessDetails(sessionId)
        .then((data) => {
          if (data) {
            setOrderDetails(data);
          }
        })
        .catch((err) => console.error("Error fetching order details:", err))
        .finally(() => setLoading(false));
    }
  }, [sessionId]);

  const fallbackOrderNumber = sessionId
    ? `ORD-${sessionId.slice(-8).toUpperCase()}`
    : "CONFIRMED";
  const displayOrderNumber =
    orderDetails?.orderNumber || paramOrderNumber || fallbackOrderNumber;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm mx-auto"
    >
      {/* Spring Animated Checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
        className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto border border-emerald-200 dark:border-emerald-800"
      >
        <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
      </motion.div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Order Placed Successfully!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
          A confirmation email with your invoice has been dispatched to your email address.
        </p>
      </div>

      {/* Order Summary Snapshot Card */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-3.5 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700/60">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
              Order Reference
            </span>
            <span className="font-mono font-black text-sm text-shop-orange">
              #{displayOrderNumber}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
              Payment Status
            </span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Paid (Stripe)
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-4 text-slate-400 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-shop-orange" />
            <span className="text-xs">Loading order snapshot...</span>
          </div>
        ) : (
          <>
            {orderDetails?.totalAmountPaid ? (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Total Amount Paid</span>
                <span className="font-black text-sm text-slate-900 dark:text-slate-100">
                  ₹{orderDetails.totalAmountPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            ) : null}

            {orderDetails?.address ? (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/40 space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-shop-orange" />
                  Delivery Destination:
                </span>
                <p className="text-slate-600 dark:text-slate-400 font-medium pl-5">
                  {orderDetails.address.recipient_name}
                </p>
                <p className="text-slate-500 dark:text-slate-400 pl-5">
                  {[
                    orderDetails.address.address_line1,
                    orderDetails.address.address_line2,
                    orderDetails.address.city,
                    orderDetails.address.state,
                    orderDetails.address.postal_code,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* Action CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link href="/orders" className="flex-1 block">
          <button
            type="button"
            className="w-full bg-shop-orange hover:bg-amber-600 text-white font-bold py-3.5 px-5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Package className="h-4 w-4" />
            <span>Track Your Order</span>
          </button>
        </Link>

        <Link href="/shop" className="flex-1 block">
          <button
            type="button"
            className="w-full border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold py-3.5 px-5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Continue Shopping</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function SuccessPage() {
  return (
    <div className="bg-slate-50/50 dark:bg-slate-950 min-h-screen py-16 sm:py-24">
      <Container className="flex items-center justify-center">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-shop-orange" />
              <span className="text-xs font-semibold text-slate-500">Loading order confirmation...</span>
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </Container>
    </div>
  );
}
