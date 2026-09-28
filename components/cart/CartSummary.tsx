"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Tag, X, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useStore } from "@/store";
import { PriceFormatter } from "@/components/shared/PriceFormatter";
import { validateCouponAction, CartItemForCouponValidation } from "@/actions/deals";

export function CartSummary() {
  const { items, appliedCoupon, setAppliedCoupon, removeAppliedCoupon, getTotals } = useStore();
  const [couponInput, setCouponInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const totals = getTotals();
  const itemCount = items.reduce((acc, item) => acc + (item.quantity || 1), 0);

  // Auto-purge zombie coupon if present but gives ₹0 discount or cart is empty
  useEffect(() => {
    if (appliedCoupon && (items.length === 0 || totals.discountCents === 0)) {
      removeAppliedCoupon();
    }
  }, [appliedCoupon, items.length, totals.discountCents, removeAppliedCoupon]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim();
    if (!code) {
      setCouponError("Please enter a coupon code");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      setIsVerifying(true);
      setCouponError(null);

      const cartItemsForValidation: CartItemForCouponValidation[] = items.map((i) => {
        const p = i.product || {};
        const priceCents =
          p.price_cents != null && Number(p.price_cents) > 0
            ? Number(p.price_cents)
            : Math.round((Number(p.price) || 0) * 100);

        return {
          productId: p.product_id ?? p.productId ?? p.id ?? p._id,
          variantId: p.variant_id ?? p.variantId ?? p.selectedVariant?.id,
          price_cents: priceCents,
          price: priceCents / 100,
          quantity: i.quantity || 1,
          isDeal: Boolean(p.isDeal),
        };
      });

      const result = await validateCouponAction(code, totals.subtotalCents, cartItemsForValidation);

      if (result.valid) {
        setAppliedCoupon({
          code: result.code,
          discountPercentage: result.discountPercent,
          fixedDiscountCents: !result.discountPercent ? result.discountCents : undefined,
          isDealCoupon: result.code.startsWith("VIP-"),
          message: result.message,
        });
        setCouponInput("");
        toast.success(`Coupon applied: ${result.code}`);
      } else {
        setCouponError(result.message || "Invalid or expired coupon");
        toast.error(result.message || "Invalid or expired coupon");
      }
    } catch (err) {
      console.error("Coupon validation error:", err);
      setCouponError("Unable to validate coupon. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeAppliedCoupon();
    setCouponError(null);
    toast.success("Coupon removed");
  };

  const checkoutHref =
    appliedCoupon && totals.discount > 0
      ? `/checkout?coupon=${encodeURIComponent(appliedCoupon.code)}`
      : "/checkout";

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 sticky top-24">
        <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
          Order Summary
        </h2>

        {/* Coupon Section */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-shop-orange" />
            Promo Code / VIP Coupon
          </label>

          {appliedCoupon && totals.discount > 0 ? (
            <div className="flex items-center justify-between p-3 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-all">
              <div className="space-y-0.5 min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-extrabold text-xs text-emerald-900 dark:text-emerald-300 tracking-wide uppercase truncate">
                    {appliedCoupon.code}
                  </span>
                  {appliedCoupon.discountPercentage ? (
                    <span className="text-[10px] font-bold bg-emerald-200/70 dark:bg-emerald-800/60 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.5 rounded-full">
                      {appliedCoupon.discountPercentage}% OFF
                    </span>
                  ) : null}
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                  {appliedCoupon.message || "Active coupon applied to order"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="p-1.5 rounded-lg text-emerald-700 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                title="Remove coupon"
                aria-label="Remove coupon"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value.toUpperCase());
                    if (couponError) setCouponError(null);
                  }}
                  placeholder="Enter code (e.g. VIP-DROP-WK40)"
                  className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs uppercase font-medium text-slate-900 dark:text-slate-100 placeholder:normal-case placeholder:font-normal placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-shop-orange/30 focus:border-shop-orange"
                  disabled={isVerifying}
                />
                <button
                  type="submit"
                  disabled={isVerifying || !couponInput.trim()}
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 flex items-center justify-center min-w-[70px]"
                >
                  {isVerifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
                </button>
              </div>
              {couponError && (
                <p className="text-[11px] text-rose-500 font-medium">{couponError}</p>
              )}
            </form>
          )}
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-2.5 text-xs font-medium border-t border-slate-100 dark:border-slate-800 pt-3">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>
              Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
            </span>
            <PriceFormatter
              amount={totals.subtotal}
              className="font-bold text-slate-900 dark:text-slate-100"
            />
          </div>

          {totals.discount > 0 && (
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50/70 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                {appliedCoupon?.code || "Coupon Savings"}
                {appliedCoupon?.discountPercentage ? ` (${appliedCoupon.discountPercentage}% OFF)` : ""}
              </span>
              <span>
                -<PriceFormatter amount={totals.discount} />
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>Delivery Charges</span>
            {totals.shipping === 0 ? (
              <span className="font-bold text-emerald-600">FREE Delivery</span>
            ) : (
              <PriceFormatter
                amount={totals.shipping}
                className="font-semibold text-slate-900 dark:text-slate-100"
              />
            )}
          </div>

          {/* Embedded 18% Indian GST Breakdown */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Estimated GST (18% Included)</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              ₹{(totals.estimatedGstCents / 100).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-base font-extrabold text-shop-dark dark:text-slate-100">
            <span>Total Amount</span>
            <PriceFormatter
              amount={totals.total}
              className="text-lg font-black text-shop-orange"
            />
          </div>
        </div>

        {/* Checkout CTA */}
        <Link href={checkoutHref} className="block w-full">
          <button
            type="button"
            className="w-full bg-shop-orange hover:bg-amber-600 text-white font-bold py-3.5 px-6 rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-md cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </Link>

        {/* Security & Warranty Trust Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Safe & Secure 256-Bit Encrypted Payments</span>
        </div>
      </div>
    </div>
  );
}
