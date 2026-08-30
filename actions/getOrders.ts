'use server';

import { auth } from '@clerk/nextjs/server';
import { getMyOrders } from '@/lib/db/products';

export async function fetchMyOrdersAction() {
  try {
    const { userId } = await auth();
    if (!userId) return [];
    return await getMyOrders(userId);
  } catch (err) {
    console.error('Error fetching orders action:', err);
    return [];
  }
}
