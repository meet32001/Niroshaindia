'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { syncCartAndWishlistOnLogin } from '@/actions/syncCartWishlist';
import { useStore } from '@/store';

const GUEST_TOKEN_KEY = 'nirosha_guest_cart_token';

export function getOrCreateGuestToken(): string {
  if (typeof window === 'undefined') return '';
  let token = localStorage.getItem(GUEST_TOKEN_KEY);
  if (!token) {
    token = `guest_${Math.random().toString(36).substring(2)}_${Date.now()}`;
    localStorage.setItem(GUEST_TOKEN_KEY, token);
  }
  return token;
}

export function useCartSync() {
  const { isSignedIn, userId } = useAuth();
  const syncedRef = useRef<string | null>(null);
  const prevIsSignedInRef = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    if (isSignedIn && userId && syncedRef.current !== userId) {
      syncedRef.current = userId;

      const guestToken =
        typeof window !== 'undefined'
          ? localStorage.getItem(GUEST_TOKEN_KEY)
          : null;

      syncCartAndWishlistOnLogin(guestToken)
        .then((res) => {
          if (res.success) {
            console.log('[CART/WISHLIST SYNC SUCCESS]:', res);
            if (guestToken) {
              localStorage.removeItem(GUEST_TOKEN_KEY);
            }
          } else {
            console.warn('[CART/WISHLIST SYNC NOTICE]:', res.error);
          }
        })
        .catch((err: unknown) => {
          const errorMessage = err instanceof Error ? err.message : 'Unknown sync error';
          console.error('[CART/WISHLIST SYNC ERROR]:', errorMessage);
        });
    }

    // Handle sign-out cleanup
    if (prevIsSignedInRef.current === true && !isSignedIn) {
      syncedRef.current = null;
      useStore.getState().resetCart();
      useStore.getState().resetFavorite();
      if (typeof window !== 'undefined') {
        const freshToken = `guest_${Math.random().toString(36).substring(2)}_${Date.now()}`;
        localStorage.setItem(GUEST_TOKEN_KEY, freshToken);
      }
    }

    prevIsSignedInRef.current = isSignedIn;
  }, [isSignedIn, userId]);
}
