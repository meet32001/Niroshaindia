'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';

export function AuthSync() {
  const { isSignedIn, isLoaded, user } = useUser();
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user?.id && syncedRef.current !== user.id) {
      syncedRef.current = user.id;

      const primaryEmail =
        user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ||
        user.emailAddresses[0]?.emailAddress ||
        '';

      if (!primaryEmail) return;

      fetch('/api/auth/sync-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: primaryEmail,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phoneNumbers?.[0]?.phoneNumber || null,
        }),
      })
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
  }, [isSignedIn, isLoaded, user]);

  return null;
}
