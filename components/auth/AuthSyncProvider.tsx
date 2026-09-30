'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { syncCurrentCustomer } from '@/actions/syncCustomer';

export function AuthSync() {
  const { isSignedIn, userId } = useAuth();

  useEffect(() => {
    if (isSignedIn && userId) {
      syncCurrentCustomer().catch(() => {
        // Non-blocking background sync failure handled gracefully
      });
    }
  }, [isSignedIn, userId]);

  return null;
}
