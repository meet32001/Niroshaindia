"use client";

import { useCartSync } from "@/hooks/useCartSync";

export function CartSyncProvider({ children }: { children: React.ReactNode }) {
  useCartSync();
  return <>{children}</>;
}
