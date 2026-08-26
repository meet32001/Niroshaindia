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
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
          Product Categories
        </h3>
        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-[11px] font-semibold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap md:flex-col gap-2">
        {categories.map((cat, idx) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rawSlug = typeof cat.slug === "string" ? cat.slug : (cat.slug as any)?.current;
          const slug = rawSlug || "category";
          const isActive = selectedCategory?.toLowerCase() === slug.toLowerCase();
          const catName = cat.name || cat.title || "Category";

          return (
            <button
              key={cat._id || cat.id || idx}
              onClick={() => setSelectedCategory(isActive ? null : slug)}
              className={cn(
                "px-5 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200 flex items-center justify-between cursor-pointer border",
                isActive
                  ? "bg-[#16a34a] text-white border-[#16a34a] font-semibold shadow-xs"
                  : "border-green-200 text-slate-700 dark:text-slate-300 hover:bg-green-50 dark:hover:bg-slate-800"
              )}
            >
              <span>{catName}</span>
              {cat.productCount !== undefined && (
                <span className={cn("text-[10px] font-bold ml-2", isActive ? "text-white/90" : "text-slate-400")}>
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
