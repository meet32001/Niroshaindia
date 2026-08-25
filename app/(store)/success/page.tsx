"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { CheckCircle2, ShoppingBag, ArrowRight, Package, Loader2 } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { useStore } from "@/store";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [fallbackOrderNumber] = useState(
    () => `ORD-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const orderNumber = searchParams.get("order_number") || fallbackOrderNumber;
  const sessionId = searchParams.get("session_id");

  const { resetCart } = useStore();

  useEffect(() => {
    resetCart();
  }, [resetCart]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-sm"
    >
      {/* Spring-Animated Check Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
        className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto border border-emerald-200 dark:border-emerald-900"
      >
        <CheckCircle2 className="h-10 w-10" />
      </motion.div>

      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-extrabold text-shop-dark dark:text-slate-100">
          Order Confirmed!
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Thank you for your purchase. We are processing your order and will ship it shortly.
        </p>
      </div>

      {/* Order Reference Pill */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
          Order Reference
        </span>
        <span className="font-mono text-sm font-extrabold text-shop-orange">
          {orderNumber}
        </span>
        {sessionId && (
          <span className="text-[10px] text-slate-400 block truncate px-2 font-mono">
            Session: {sessionId}
          </span>
        )}
      </div>

      {/* Action CTAs */}
      <div className="flex flex-col gap-3 pt-2">
        <Link
          href="/shop"
          className="inline-flex items-center justify-center gap-2 bg-shop-orange hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-xl text-sm transition-all duration-300 shadow-md w-full cursor-pointer"
        >
          <Package className="h-4 w-4" />
          <span>Explore More Electronics</span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold py-2.5 px-6 rounded-xl text-xs transition-colors w-full cursor-pointer"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>Back to Home</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}

export default function SuccessPage() {
  return (
    <div className="py-16 md:py-24">
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
