"use client";

import { useState } from "react";
import { HomeTabBar } from "@/components/product/HomeTabBar";
import { ProductGrid } from "@/components/product/ProductGrid";

export function HomeTabContainer() {
  const [selectedTab, setSelectedTab] = useState("gadget");

  return (
    <section className="space-y-6">
      <HomeTabBar selectedTab={selectedTab} onTabSelect={setSelectedTab} />
      <ProductGrid selectedTab={selectedTab} />
    </section>
  );
}
