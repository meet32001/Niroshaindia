'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { syncCurrentCustomer } from '@/actions/syncCustomer';

export function AuthSync() {
  const { isSignedIn, userId } = useAuth();

  useEffect(() => {
    if (isSignedIn && userId) {
      syncCurrentCustomer().then((res) => {
        console.log('[CLIENT AUTH SYNC RESULT]:', res);
      });
    }
  }, [isSignedIn, userId]);

  return null;
}
