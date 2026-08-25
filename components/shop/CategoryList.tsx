"use client";

import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CategoryListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[];
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
}

export function CategoryList({
  categories,
  selectedCategory,
  setSelectedCategory,
}: CategoryListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-shop-dark dark:text-slate-100 uppercase tracking-wider">
          Product Categories
        </h3>
        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-[11px] font-semibold text-shop-orange hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        {categories.map((cat, idx) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rawSlug = typeof cat.slug === "string" ? cat.slug : (cat.slug as any)?.current;
          const slug = rawSlug || "category";
          const isActive = selectedCategory?.toLowerCase() === slug.toLowerCase();

          return (
            <button
              key={cat._id || cat.id || idx}
              onClick={() => setSelectedCategory(isActive ? null : slug)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 flex items-center justify-between cursor-pointer",
                isActive
                  ? "bg-shop-orange/10 text-shop-orange font-semibold border border-shop-orange/30"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={isActive}
                  onChange={() => {}}
                  className="accent-shop-orange cursor-pointer"
                />
                <span className="line-clamp-1">{cat.title}</span>
              </div>
              {cat.productCount !== undefined && (
                <span className="text-[10px] text-slate-400 font-bold">
                  ({cat.productCount})
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
