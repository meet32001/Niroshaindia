"use client";

import Link from "next/link";
import { PRODUCT_TYPES } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export interface HomeTabBarProps {
  selectedTab: string;
  onTabSelect: (tab: string) => void;
}

export function HomeTabBar({ selectedTab, onTabSelect }: HomeTabBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-slate-200 dark:border-slate-800">
      {/* Left Pill Buttons */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {PRODUCT_TYPES.map((item) => {
          const isActive =
            selectedTab.toLowerCase() === item.value.toLowerCase() ||
            selectedTab.toLowerCase() === item.title.toLowerCase();

          return (
            <button
              key={item.value}
              onClick={() => onTabSelect(item.value)}
              className={cn(
                "px-4 py-1.5 md:px-6 md:py-2 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer",
                isActive
                  ? "bg-shop-orange text-white border border-shop-orange shadow-md"
                  : "border border-shop-orange/30 text-shop-dark dark:text-slate-200 hover:bg-shop-orange hover:text-white hover:border-shop-orange"
              )}
            >
              {item.title}
            </button>
          );
        })}
      </div>

      {/* Right Action Link */}
      <Link
        href="/shop"
        className="border border-shop-orange/30 text-shop-dark dark:text-slate-200 hover:bg-shop-orange hover:text-white px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 shrink-0"
      >
        See all
      </Link>
    </div>
  );
}
