"use client";

import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BrandListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  brands: any[];
  selectedBrand: string | null;
  setSelectedBrand: (brand: string | null) => void;
}

export function BrandList({
  brands,
  selectedBrand,
  setSelectedBrand,
}: BrandListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
          Brands
        </h3>
        {selectedBrand && (
          <button
            onClick={() => setSelectedBrand(null)}
            className="text-[11px] font-semibold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar pr-1">
        {brands.map((brand, idx) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rawSlug = typeof brand.slug === "string" ? brand.slug : (brand.slug as any)?.current;
          const slug = rawSlug || brand.title?.toLowerCase() || "brand";
          const isActive = selectedBrand?.toLowerCase() === slug.toLowerCase();

          return (
            <button
              key={brand._id || brand.id || idx}
              onClick={() => setSelectedBrand(isActive ? null : slug)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 flex items-center justify-between cursor-pointer",
                isActive
                  ? "bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 dark:bg-slate-800 dark:text-emerald-400"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={isActive}
                  onChange={() => {}}
                  className="accent-emerald-600 cursor-pointer"
                />
                <span className="line-clamp-1">{brand.title}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
