"use client";

import { CategoryProductSection } from "@/components/home/CategoryProductSection";

export interface HomeTabContainerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialProducts?: any[];
}

export function HomeTabContainer({ initialProducts = [] }: HomeTabContainerProps) {
  return <CategoryProductSection initialProducts={initialProducts} />;
}

