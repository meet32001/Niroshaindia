"use client";

import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { ShoppingBag, Trash2, RotateCcw, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Container } from "@/components/layout/Container";
import { Title } from "@/components/ui/text";
import { PriceFormatter } from "@/components/shared/PriceFormatter";
import { QuantityButtons } from "@/components/product/QuantityButtons";
import { AddToWishlistButton } from "@/components/product/AddToWishlistButton";
import { NoAccess } from "@/components/cart/NoAccess";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { useStore } from "@/store";
import { useIsMounted } from "@/hooks/useIsMounted";
import { urlFor } from "@/lib/image";

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

  const handleResetCart = () => {
    if (window.confirm("Are you sure you want to reset your shopping cart?")) {
      resetCart();
      toast.success("Cart reset successfully");
    }
  };

  const handleDeleteItem = (productId: string, name: string) => {
    deleteCartProduct(productId);
    toast.success(`${name.slice(0, 18)}... removed from cart`);
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

  return (
    <div className="bg-slate-50/50 dark:bg-slate-950 min-h-screen pb-24">
      <Container className="py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-shop-orange">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <Title className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                Shopping Cart
              </Title>
              <p className="text-xs text-slate-500 font-medium">
                {items.length} {items.length === 1 ? "item" : "items"} in your cart
              </p>
            </div>
          </div>

          <button
            onClick={handleResetCart}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 font-semibold transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Cart</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((cartItem) => {
              const product = cartItem.product;
              const productId = product?._id || product?.id || "";
              const name = product?.name || "Product Name";
              const price = product?.price || 0;
              const discount = product?.discount || 0;
              const originalPrice = discount > 0 ? price / (1 - discount / 100) : price;
              const image = getImageUrl(product?.images?.[0] || product?.image);

              return (
                <div
                  key={productId}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center transition-all hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-slate-800">
                      <Image
                        src={image}
                        alt={name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                        <Link href={`/product/${product?.slug?.current || product?.slug || productId}`} className="hover:text-shop-orange transition-colors">
                          {name}
                        </Link>
                      </h3>
                      {product?.variant_name && (
                        <p className="text-xs text-slate-500 font-medium">Variant: {product.variant_name}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs">
                        <PriceFormatter amount={price} className="font-black text-slate-900 dark:text-slate-100 text-sm" />
                        {discount > 0 && (
                          <PriceFormatter amount={originalPrice} className="line-through text-slate-400 font-medium" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <QuantityButtons product={product} />

                    <div className="flex items-center gap-2">
                      <AddToWishlistButton product={product} className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors" />
                      <button
                        onClick={() => handleDeleteItem(productId, name)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Summary */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 sticky top-24">
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
                Order Summary
              </h2>

              <div className="space-y-2.5 text-xs font-medium">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal ({items.length} items)</span>
                  <PriceFormatter amount={subtotalPrice} className="font-bold text-slate-900 dark:text-slate-100" />
                </div>

                {totalSavings > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Discount Savings</span>
                    <span>-<PriceFormatter amount={totalSavings} /></span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Delivery Charges</span>
                  <span className="font-bold text-emerald-600">FREE Delivery</span>
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
              <Link href="/checkout" className="block w-full">
                <button
                  type="button"
                  className="w-full bg-shop-orange hover:bg-amber-600 text-white font-bold py-3.5 px-6 rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-md cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>

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

      {/* Mobile Sticky Bottom Checkout Drawer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 z-40 flex items-center justify-between shadow-lg md:hidden">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Total Payable
          </span>
          <PriceFormatter amount={totalPrice} className="text-lg font-extrabold text-shop-orange" />
        </div>

        <Link href="/checkout">
          <button
            type="button"
            className="bg-shop-orange hover:bg-amber-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <span>Checkout</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </Link>
      </div>
    </div>
  );
}
