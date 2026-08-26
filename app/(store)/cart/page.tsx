"use client";

import { useState } from "react";
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
import { DeliveryAddress, MOCK_ADDRESSES } from "@/components/cart/DeliveryAddress";
import { NoAccess } from "@/components/cart/NoAccess";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { useStore } from "@/store";
import { useIsMounted } from "@/hooks/useIsMounted";
import { urlFor } from "@/lib/image";
import { createCheckoutSession } from "@/actions/createCheckoutSession";

export default function CartPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { items, deleteCartProduct, resetCart, getTotalPrice, getSubtotalPrice } = useStore();
  const isMounted = useIsMounted();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

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

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);
      const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const metadata = {
        orderNumber,
        customerName: user?.fullName || "Customer",
        customerEmail: user?.primaryEmailAddress?.emailAddress || "customer@example.com",
        clerkUserId: user?.id || "",
        address: MOCK_ADDRESSES[0],
      };

      const checkoutUrl = await createCheckoutSession(items, metadata);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        toast.error("Failed to initialize Stripe checkout session");
        setIsCheckingOut(false);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("An error occurred during checkout setup");
      setIsCheckingOut(false);
    }
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
    <div className="py-8 md:py-12 pb-24 md:pb-12">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Items Details Table */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-shop-orange/10 text-shop-orange">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <Title className="text-xl font-bold">Shopping Cart</Title>
                  <span className="text-xs text-slate-500 font-medium">
                    {items.reduce((acc, item) => acc + item.quantity, 0)} items in your cart
                  </span>
                </div>
              </div>

              <button
                onClick={handleResetCart}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Cart</span>
              </button>
            </div>

            {/* Items Table Container */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800 overflow-hidden shadow-xs">
              {items.map((item) => {
                const product = item.product;
                const id = String(product._id || product.id || "");
                const name = product.name || product.title || "Electronics Product";
                const price = product.price || 0;
                const itemTotal = price * item.quantity;
                const stock = product.stock !== undefined ? product.stock : 10;
                const isStock = stock > 0;
                const mainImg = Array.isArray(product.images) ? product.images[0] : product.image;
                const imgUrl = getImageUrl(mainImg);
                const categoryName = Array.isArray(product.categories)
                  ? product.categories.join(", ")
                  : product.productType || "Gadget";

                return (
                  <div
                    key={id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Thumbnail & Product Details */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <Link
                        href={`/product/${product.slug?.current || product.slug}`}
                        className="relative h-20 w-20 shrink-0 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 overflow-hidden p-2 flex items-center justify-center group"
                      >
                        <Image
                          src={imgUrl}
                          alt={name}
                          fill
                          sizes="80px"
                          className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      <div className="space-y-1.5">
                        <Link
                          href={`/product/${product.slug?.current || product.slug}`}
                          className="text-sm font-bold text-shop-dark dark:text-slate-100 hover:text-shop-orange transition-colors line-clamp-1"
                        >
                          {name}
                        </Link>

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-[10px] font-bold text-shop-orange uppercase bg-shop-orange/10 px-2 py-0.5 rounded-md">
                            {categoryName}
                          </span>

                          {isStock ? (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                              In Stock
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                              Out of Stock
                            </span>
                          )}
                        </div>

                        {/* Sub-Actions: Wishlist & Delete */}
                        <div className="flex items-center gap-3 pt-1">
                          <AddToWishlistButton product={product} className="p-1 border-0 shadow-none bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800" />
                          <button
                            onClick={() => handleDeleteItem(id, name)}
                            className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Stepper & Line Price */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <QuantityButtons product={product} />

                      <div className="text-right min-w-[90px]">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                          Line Total
                        </span>
                        <PriceFormatter amount={itemTotal} className="text-base font-black text-shop-orange" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Address Selector & Order Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Delivery Address Selector */}
            <DeliveryAddress />

            {/* Sticky Order Summary Panel */}
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
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-shop-orange hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-md cursor-pointer"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Preparing Checkout...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
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

      {/* Mobile Sticky Bottom Checkout Drawer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 z-40 flex items-center justify-between shadow-lg md:hidden">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Total Payable
          </span>
          <PriceFormatter amount={totalPrice} className="text-lg font-extrabold text-shop-orange" />
        </div>

        <button
          onClick={handleCheckout}
          disabled={isCheckingOut}
          className="bg-shop-orange hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
        >
          {isCheckingOut ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Preparing...</span>
            </>
          ) : (
            <>
              <span>Checkout</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
