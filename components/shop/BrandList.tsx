"use client";

import { useState } from "react";
import { RotateCcw, Search } from "lucide-react";
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
  const [filterQuery, setFilterQuery] = useState("");

  const activeBrands = selectedBrand
    ? selectedBrand
        .split(",")
        .map((b) => b.trim().toLowerCase())
        .filter(Boolean)
    : [];

  const handleToggleBrand = (slug: string) => {
    const s = slug.toLowerCase();
    let updated: string[];
    if (activeBrands.includes(s)) {
      updated = activeBrands.filter((b) => b !== s);
    } else {
      updated = [...activeBrands, s];
    }

    if (updated.length === 0) {
      setSelectedBrand(null);
    } else {
      setSelectedBrand(updated.join(","));
    }
  };

  const filteredBrands = brands.filter((brand) => {
    if (!filterQuery) return true;
    const name = (brand.name || brand.title || "").toLowerCase();
    return name.includes(filterQuery.toLowerCase());
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
          Brands {activeBrands.length > 0 && `(${activeBrands.length})`}
        </h3>
        {activeBrands.length > 0 && (
          <button
            onClick={() => setSelectedBrand(null)}
            className="text-[11px] font-semibold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {brands.length > 8 && (
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search brands..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      )}

      <div className="space-y-1 max-h-56 overflow-y-auto no-scrollbar pr-1">
        {filteredBrands.length === 0 ? (
          <div className="text-xs text-slate-400 py-3 text-center">No brands found</div>
        ) : (
          filteredBrands.map((brand, idx) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rawSlug = typeof brand.slug === "string" ? brand.slug : (brand.slug as any)?.current;
            const slug = (rawSlug || brand.title?.toLowerCase() || brand.name?.toLowerCase() || "brand").toLowerCase();
            const isActive = activeBrands.includes(slug);
            const brandName = brand.name || brand.title || "Brand";

            return (
              <button
                key={brand._id || brand.id || idx}
                onClick={() => handleToggleBrand(slug)}
                className={cn(
                  "w-full text-left px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 flex items-center justify-between cursor-pointer group",
                  isActive
                    ? "bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 dark:bg-slate-800 dark:text-emerald-400"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => {}}
                    className="accent-emerald-600 cursor-pointer h-3.5 w-3.5 rounded border-slate-300"
                  />
                  <span className="truncate">{brandName}</span>
                </div>
                {brand.productCount !== undefined && (
                  <span className="text-[10px] font-bold text-slate-400 shrink-0 ml-1">
                    ({brand.productCount})
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
