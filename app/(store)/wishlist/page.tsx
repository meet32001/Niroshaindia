"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Heart, RotateCcw, X, ArrowRight, Loader2, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { Container } from "@/components/layout/Container";
import { Title } from "@/components/ui/text";
import { PriceFormatter } from "@/components/shared/PriceFormatter";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { useStore } from "@/store";
import { useIsMounted } from "@/hooks/useIsMounted";
import { urlFor } from "@/sanity/lib/image";

export default function WishlistPage() {
  const { favoriteProduct, addToFavorite, resetFavorite } = useStore();
  const isMounted = useIsMounted();
  const [visibleCount, setVisibleCount] = useState(5);

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-shop-orange" />
        <span className="text-xs font-semibold text-slate-500">Loading wishlist...</span>
      </div>
    );
  }

  const handleResetWishlist = () => {
    if (window.confirm("Are you sure you want to reset your saved wishlist?")) {
      resetFavorite();
      toast.success("Wishlist reset successfully");
    }
  };

  const handleRemoveItem = (product: unknown, name: string) => {
    addToFavorite(product);
    toast.success(`${name.slice(0, 18)}... removed from wishlist`);
  };

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

  const visibleProducts = favoriteProduct.slice(0, visibleCount);

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
            onClick={handleResetWishlist}
            className="border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-600 hover:text-white px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Wishlist</span>
          </button>
        </div>

        {/* Tabular Wishlist View */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4 w-12 text-center">Remove</th>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Stock Status</th>
                <th className="py-3.5 px-4">Unit Price</th>
                <th className="py-3.5 px-4 w-48 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <AnimatePresence mode="popLayout">
                {visibleProducts.map((product, idx) => {
                  const id = String(product._id || product.id || idx);
                  const name = product.name || product.title || "Electronics Product";
                  const price = product.price || 0;
                  const stock = product.stock !== undefined ? product.stock : 10;
                  const isStock = stock > 0;
                  const mainImg = Array.isArray(product.images) ? product.images[0] : product.image;
                  const imgUrl = getImageUrl(mainImg);
                  const categoryName = Array.isArray(product.categories)
                    ? product.categories.join(", ")
                    : product.category || product.productType || "Electronics";
                  const slug = product.slug?.current || product.slug || "product";

                  return (
                    <motion.tr
                      key={id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Quick Remove X */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleRemoveItem(product, name)}
                          className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 inline-flex items-center justify-center transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </td>

                      {/* Product Thumbnail & Title */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/product/${slug}`}
                            className="relative h-14 w-14 shrink-0 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 overflow-hidden p-1.5 flex items-center justify-center group"
                          >
                            <Image
                              src={imgUrl}
                              alt={name}
                              fill
                              sizes="56px"
                              className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                            />
                          </Link>

                          <Link
                            href={`/product/${slug}`}
                            className="font-bold text-shop-dark dark:text-slate-100 hover:text-shop-orange transition-colors line-clamp-1 max-w-xs"
                          >
                            {name}
                          </Link>
                        </div>
                      </td>

                      {/* Category Pill */}
                      <td className="py-4 px-4">
                        <span className="inline-block text-[10px] font-bold text-shop-orange uppercase bg-shop-orange/10 px-2.5 py-1 rounded-md">
                          {categoryName}
                        </span>
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-4 px-4">
                        {isStock ? (
                          <span className="inline-block text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md">
                            In Stock
                          </span>
                        ) : (
                          <span className="inline-block text-[10px] font-bold text-rose-600 bg-rose-100 dark:bg-rose-950/60 px-2.5 py-1 rounded-md">
                            Out of Stock
                          </span>
                        )}
                      </td>

                      {/* Unit Price */}
                      <td className="py-4 px-4">
                        <PriceFormatter amount={price} className="text-sm font-extrabold text-shop-dark dark:text-slate-100" />
                      </td>

                      {/* Action CTA */}
                      <td className="py-4 px-4 text-right">
                        <div className="max-w-[160px] ml-auto">
                          <AddToCartButton product={product} />
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Load More Pagination Control */}
        {favoriteProduct.length > visibleCount && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setVisibleCount((prev) => prev + 5)}
              className="border border-slate-300 dark:border-slate-700 hover:border-shop-orange text-slate-700 dark:text-slate-300 hover:text-shop-orange font-semibold px-6 py-2.5 rounded-full text-xs flex items-center gap-1.5 transition-all duration-300 shadow-xs cursor-pointer"
            >
              <span>Load More ({favoriteProduct.length - visibleCount} remaining)</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        )}
      </Container>
    </div>
  );
}
