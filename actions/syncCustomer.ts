'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { syncUserToSupabase } from '@/lib/db/sync-user';

export async function syncCurrentCustomer() {
  try {
    const { userId } = await auth();
    console.log('[SYNC] Checking auth state... userId:', userId);

    if (!userId) {
      console.warn('[SYNC] No active userId found.');
      return { success: false, reason: 'No session' };
    }

    const user = await currentUser();
    if (!user) {
      console.warn('[SYNC] currentUser() returned null for userId:', userId);
      return { success: false, reason: 'User not found in Clerk' };
    }

    const email =
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ||
      user.emailAddresses[0]?.emailAddress ||
      '';

    const customer = await syncUserToSupabase({
      id: user.id,
      email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phoneNumbers?.[0]?.phoneNumber || null,
    });

    return { success: true, customer };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Sync failed';
    console.error('[SYNC ERROR]:', err);
    return { success: false, error: errorMessage };
  }
}
