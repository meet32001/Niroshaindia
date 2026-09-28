"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { ShoppingBag, RotateCcw, ArrowRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Container } from "@/components/layout/Container";
import { Title } from "@/components/ui/text";
import { PriceFormatter } from "@/components/shared/PriceFormatter";
import { NoAccess } from "@/components/cart/NoAccess";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { CartSummary } from "@/components/cart/CartSummary";
import { useStore, getProductId } from "@/store";
import { useIsMounted } from "@/hooks/useIsMounted";

export default function CartPage() {
  const { isLoaded, isSignedIn } = useUser();
  const { items, resetCart, getTotals, appliedCoupon, removeAppliedCoupon } = useStore();
  const isMounted = useIsMounted();

  const totals = getTotals();

  // Auto-purge zombie coupon if cart is empty or discount drops to 0
  useEffect(() => {
    if (appliedCoupon && (items.length === 0 || totals.discountCents === 0)) {
      removeAppliedCoupon();
    }
  }, [appliedCoupon, items.length, totals.discountCents, removeAppliedCoupon]);

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

  const itemCount = items.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const handleResetCart = () => {
    if (window.confirm("Are you sure you want to reset your shopping cart?")) {
      resetCart();
      toast.success("Cart reset successfully");
    }
  };

  const checkoutHref =
    appliedCoupon && totals.discount > 0
      ? `/checkout?coupon=${encodeURIComponent(appliedCoupon.code)}`
      : "/checkout";

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
                {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
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
              const key = getProductId(cartItem.product);
              return <CartItemRow key={key} item={cartItem} />;
            })}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <CartSummary />
          </div>
        </div>
      </Container>

      {/* Mobile Sticky Bottom Checkout Drawer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 z-40 flex items-center justify-between shadow-lg md:hidden">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Total Payable
          </span>
          <PriceFormatter amount={totals.total} className="text-lg font-extrabold text-shop-orange" />
        </div>

        <Link href={checkoutHref}>
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
