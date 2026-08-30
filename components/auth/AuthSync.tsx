'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';

export function AuthSync() {
  const { isSignedIn, userId } = useAuth();
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (isSignedIn && userId && syncedRef.current !== userId) {
      syncedRef.current = userId;
      fetch('/api/auth/sync-customer', { method: 'POST' })
        .then(async (res) => {
          if (!res.ok) {
            console.warn('[AUTH SYNC NOTICE]: Endpoint returned status', res.status);
            return;
          }
          const data = await res.json();
          console.log('[AUTH SYNC COMPLETED]:', data);
        })
        .catch((err) => console.error('[AUTH SYNC FAILED]:', err));
    }
  }, [isSignedIn, userId]);

  return null;
}
