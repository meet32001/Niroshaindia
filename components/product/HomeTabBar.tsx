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
                "px-5 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 cursor-pointer border",
                isActive
                  ? "bg-[#16a34a] text-white border-[#16a34a] shadow-xs"
                  : "border-green-200 text-slate-700 dark:text-slate-200 hover:bg-green-50 dark:hover:bg-slate-800"
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
        className="border border-green-200 text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 px-5 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 shrink-0"
      >
        See all
      </Link>
    </div>
  );
}
