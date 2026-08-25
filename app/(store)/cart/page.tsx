"use client";

import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { ShoppingBag, Trash2, RotateCcw, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { PriceFormatter } from "@/components/shared/PriceFormatter";
import { QuantityButtons } from "@/components/product/QuantityButtons";
import { NoAccess } from "@/components/cart/NoAccess";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { useStore } from "@/store";
import { useIsMounted } from "@/hooks/useIsMounted";
import { urlFor } from "@/sanity/lib/image";

export default function CartPage() {
  const { isLoaded, isSignedIn } = useUser();
  const { items, deleteCartProduct, resetCart, getTotalPrice, getSubtotalPrice } = useStore();
  const isMounted = useIsMounted();

  if (!isLoaded || !isMounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-shop-orange" />
        <span className="text-xs font-semibold text-slate-500">Loading your cart...</span>
      </div>
    );
  }

  if (!isSignedIn) {
    return <NoAccess />;
  }

  if (items.length === 0) {
    return <EmptyCart />;
  }

  const totalPrice = getTotalPrice();
  const subtotalPrice = getSubtotalPrice();
  const totalSavings = Math.max(0, subtotalPrice - totalPrice);

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

  return (
    <div className="py-8 md:py-12">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Items List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-shop-orange/10 text-shop-orange">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-shop-dark dark:text-slate-100">
                    Shopping Cart
                  </h1>
                  <span className="text-xs text-slate-500 font-medium">
                    {items.reduce((acc, item) => acc + item.quantity, 0)} items in your cart
                  </span>
                </div>
              </div>

              <button
                onClick={resetCart}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Cart</span>
              </button>
            </div>

            {/* Items Table */}
            <div className="space-y-4">
              {items.map((item) => {
                const product = item.product;
                const id = String(product._id || product.id || "");
                const name = product.name || product.title || "Electronics Product";
                const price = product.price || 0;
                const itemTotal = price * item.quantity;
                const mainImg = Array.isArray(product.images) ? product.images[0] : product.image;
                const imgUrl = getImageUrl(mainImg);

                return (
                  <div
                    key={id}
                    className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs transition-all hover:border-slate-300"
                  >
                    {/* Thumbnail & Title */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="relative h-20 w-20 shrink-0 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 overflow-hidden p-2 flex items-center justify-center">
                        <Image
                          src={imgUrl}
                          alt={name}
                          fill
                          sizes="80px"
                          className="object-contain p-1"
                        />
                      </div>

                      <div className="space-y-1">
                        <Link
                          href={`/product/${product.slug?.current || product.slug}`}
                          className="text-sm font-bold text-shop-dark dark:text-slate-100 hover:text-shop-orange transition-colors line-clamp-1"
                        >
                          {name}
                        </Link>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>Unit Price:</span>
                          <PriceFormatter amount={price} className="font-semibold text-slate-700 dark:text-slate-300" />
                        </div>
                      </div>
                    </div>

                    {/* Controls & Subtotal */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <QuantityButtons product={product} />

                      <div className="text-right min-w-[80px]">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                          Subtotal
                        </span>
                        <PriceFormatter amount={itemTotal} className="text-sm font-extrabold text-shop-orange" />
                      </div>

                      <button
                        onClick={() => deleteCartProduct(id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        aria-label="Delete item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
              <h2 className="text-lg font-bold text-shop-dark dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-3">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs md:text-sm">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <PriceFormatter amount={subtotalPrice} className="font-semibold text-slate-900 dark:text-slate-100" />
                </div>

                {totalSavings > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 font-semibold">
                    <span>Discount Savings</span>
                    <span>-<PriceFormatter amount={totalSavings} /></span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Estimated Shipping</span>
                  <span className="text-emerald-600 font-semibold uppercase text-xs">Free</span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Estimated GST (Included)</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">₹0</span>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-base font-extrabold text-shop-dark dark:text-slate-100">
                  <span>Total Amount</span>
                  <PriceFormatter amount={totalPrice} className="text-lg font-black text-shop-orange" />
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => alert("Stripe Checkout Integration coming up in Phase 9!")}
                className="w-full bg-shop-orange hover:bg-amber-600 text-white font-bold py-3.5 px-6 rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-md cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Trust Features */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Encrypted 256-Bit SSL Payment Protection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
