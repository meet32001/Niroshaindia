'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

function AuthCallbackContent() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !user) {
      router.replace('/sign-in');
      return;
    }

    if (syncedRef.current) return;
    syncedRef.current = true;

    const syncCustomer = async () => {
      const primaryEmail =
        user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ||
        user.emailAddresses[0]?.emailAddress ||
        '';

      try {
        const res = await fetch('/api/auth/sync-customer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            email: primaryEmail,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: user.phoneNumbers?.[0]?.phoneNumber || null,
          }),
        });
        const data = await res.json();
        console.log('[AUTH-CALLBACK] Sync result:', data);
      } catch (err) {
        console.error('[AUTH-CALLBACK] Sync fetch failed:', err);
      } finally {
        // Navigate to specified redirect path or fallback to /shop
        const redirectParam = searchParams.get('redirect') || searchParams.get('redirect_url');
        const destination = redirectParam ? decodeURIComponent(redirectParam) : '/shop';
        router.replace(destination);
      }
    };

    syncCustomer();
  }, [isLoaded, isSignedIn, user, router, searchParams]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-600 font-medium">Finalizing your account setup...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Finalizing your account setup...</p>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
