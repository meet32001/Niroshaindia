"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useStore } from "@/store";
import { syncCurrentCustomer } from "@/actions/syncCustomer";
import { syncUserCartAction } from "@/actions/syncCart";

const GUEST_TOKEN_KEY = "nirosha_guest_cart_token";

export function getOrCreateGuestToken(): string {
  if (typeof window === "undefined") return "";
  let token = localStorage.getItem(GUEST_TOKEN_KEY);
  if (!token) {
    token = `guest_${Math.random().toString(36).substring(2)}_${Date.now()}`;
    localStorage.setItem(GUEST_TOKEN_KEY, token);
  }
  return token;
}

export function useCartSync() {
  const { isSignedIn, isLoaded, user } = useUser();
  const prevIsSignedInRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    const syncUserCartAndProfile = async () => {
      try {
        // 1. Perform JIT Customer Sync via Server Action (bypasses RLS & works on localhost)
        const syncResult = await syncCurrentCustomer();

        if (!syncResult.success) {
          console.warn("JIT Customer Sync notice:", syncResult.reason || syncResult.error);
        }

        // 2. Perform Cart Sync via Server Action (bypasses client RLS limits)
        const guestToken = getOrCreateGuestToken();
        const localItems = useStore.getState().items;
        const formattedItems = localItems.map((item) => ({
          productId: String(item.product._id || item.product.id || ""),
          variantId: String(
            item.product.product_variants?.[0]?.id ||
            item.product.variant_id ||
            item.product._id ||
            item.product.id ||
            ""
          ),
          quantity: item.quantity,
        }));

        await syncUserCartAction(guestToken, formattedItems);
      } catch (err) {
        console.error("Cart & Wishlist sync notice:", err);
      }
    };

    // Transition from unauthenticated to authenticated
    if (isSignedIn && user?.id) {
      syncUserCartAndProfile();
    }

    // Transition from authenticated to signed-out
    if (prevIsSignedInRef.current === true && !isSignedIn) {
      useStore.getState().resetCart();
      useStore.getState().resetFavorite();
      if (typeof window !== "undefined") {
        const freshToken = `guest_${Math.random().toString(36).substring(2)}_${Date.now()}`;
        localStorage.setItem(GUEST_TOKEN_KEY, freshToken);
      }
    }

    prevIsSignedInRef.current = isSignedIn;
  }, [isSignedIn, isLoaded, user]);
}
