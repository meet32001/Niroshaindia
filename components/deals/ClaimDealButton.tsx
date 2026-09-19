"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ArrowRight, Loader2, Sparkles, Flame } from "lucide-react";
import toast from "react-hot-toast";
import { useStore } from "@/store";
import { claimVipDeal } from "@/actions/deals";
import { cn } from "@/lib/utils";

interface ClaimDealButtonProps {
  variantId: number;
  couponCode: string;
  isBumper?: boolean;
  product?: {
    id: number;
    name: string;
    slug: string;
    dealPriceCents: number;
    mrpCents: number;
    imageUrl: string;
  };
  className?: string;
  children?: React.ReactNode;
}

export function ClaimDealButton({
  variantId,
  couponCode,
  isBumper = false,
  product,
  className,
  children,
}: ClaimDealButtonProps) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const { addItem } = useStore();
  const [loading, setLoading] = useState(false);

  const handleClaim = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoaded) return;

    // 1. If not authenticated, redirect to sign-in with return path preserving deal
    if (!isSignedIn) {
      toast("Please sign in to unlock your VIP exclusive deal pricing", {
        icon: "🔒",
      });
      const redirectUrl = `/checkout?apply_deal=${encodeURIComponent(couponCode)}&variant_id=${variantId}`;
      router.push(`/sign-in?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }

    setLoading(true);

    try {
      // 2. Add product to client store immediately for instantaneous checkout hydration
      if (product) {
        const productForStore = {
          id: product.id,
          _id: String(product.id),
          name: product.name,
          slug: product.slug,
          price: product.dealPriceCents / 100,
          discount: Math.round(((product.mrpCents - product.dealPriceCents) / product.mrpCents) * 100),
          image: product.imageUrl,
          images: [product.imageUrl],
          variantId,
        };
        addItem(productForStore);
      }

      toast.success(
        isBumper
          ? "🔥 Festival Bumper Deal Applied! Heading to Checkout..."
          : `VIP Deal & coupon ${couponCode} applied!`,
        { duration: 2500 }
      );

      // 3. Trigger server action to register cart & redirect to checkout
      await claimVipDeal(variantId, couponCode);
    } catch (err: any) {
      // Note: Next.js redirect throws a NEXT_REDIRECT digest which is normal
      if (err?.message?.includes("NEXT_REDIRECT")) {
        return;
      }
      console.error("[ClaimDealButton] Error claiming deal:", err);
      // Fallback client navigation
      router.push(`/checkout?coupon=${encodeURIComponent(couponCode)}&variant_id=${variantId}`);
    } finally {
      // Keep loading spinner until navigation completes
      setTimeout(() => setLoading(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClaim}
      disabled={loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md disabled:opacity-75 disabled:cursor-not-allowed",
        isBumper
          ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black py-3.5 px-6 rounded-xl shadow-amber-500/25 shadow-lg"
          : "bg-[#166534] hover:bg-[#15803d] text-white py-3 px-4 rounded-xl",
        className
      )}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Claiming VIP Deal...</span>
        </>
      ) : children ? (
        children
      ) : isBumper ? (
        <>
          <Flame className="w-4 h-4 fill-slate-950 text-slate-950" />
          <span>Claim Festival Bumper Deal & Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </>
      ) : (
        <>
          <Sparkles className="w-3.5 h-3.5" />
          <span>Claim VIP Deal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </>
      )}
    </button>
  );
}
