"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Heart, RotateCcw, ArrowRight, Loader2 } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Title } from "@/components/ui/text";
import { ProductCard } from "@/components/product/ProductCard";
import { useStore } from "@/store";
import { useIsMounted } from "@/hooks/useIsMounted";

export default function WishlistPage() {
  const { favoriteProduct, resetFavorite } = useStore();
  const isMounted = useIsMounted();

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-shop-orange" />
        <span className="text-xs font-semibold text-slate-500">Loading wishlist...</span>
      </div>
    );
  }

  if (favoriteProduct.length === 0) {
    return (
      <Container className="py-16 md:py-24 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-xs"
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 mx-auto border border-rose-200 dark:border-rose-900"
          >
            <Heart className="h-10 w-10 fill-rose-500" />
          </motion.div>

          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-bold text-shop-dark dark:text-slate-100">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Save your favorite gadgets and electronics by clicking the heart icon on any product card!
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 bg-shop-orange hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-xl text-sm transition-all duration-300 shadow-md w-full"
            >
              <span>Discover Products</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </Container>
    );
  }

  return (
    <div className="py-8 md:py-12">
      <Container className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <Title className="text-xl md:text-2xl font-extrabold">My Saved Wishlist</Title>
            <span className="text-xs text-slate-500 font-medium">
              {favoriteProduct.length} items saved for later
            </span>
          </div>

          <button
            onClick={resetFavorite}
            className="border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-600 hover:text-white px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Wishlist</span>
          </button>
        </div>

        {/* Product Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
          >
            {favoriteProduct.map((product, index) => (
              <motion.div
                key={product._id || product.id || index}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <ProductCard {...product} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </Container>
    </div>
  );
}
