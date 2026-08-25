"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";

export function EmptyCart() {
  return (
    <Container className="py-16 md:py-24 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-xs"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto"
        >
          <ShoppingBag className="h-10 w-10" />
        </motion.div>

        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Your Cart is Feeling Lonely
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Your shopping cart is currently empty. Explore our latest flagship electronics, gadgets, and hot weekly deals!
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl text-sm transition-all duration-300 shadow-md w-full cursor-pointer"
          >
            <span>Discover Products</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </Container>
  );
}
