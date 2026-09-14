"use client";

import React from "react";
import { Star, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RatingFilterProps {
  selectedRating: number | null; // e.g. 4 or 3
  onRatingChange: (rating: number | null) => void;
  totalProductsCount?: number;
}

export function RatingFilter({
  selectedRating,
  onRatingChange,
  totalProductsCount = 5562,
}: RatingFilterProps) {
  const RATING_OPTIONS = [
    { stars: 4, label: "4★ & above", count: totalProductsCount },
    { stars: 3, label: "3★ & above", count: totalProductsCount },
  ];

  return (
    <div className="space-y-3 pt-4 border-t border-slate-200/80 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
          Customer Rating
        </h3>
        {selectedRating && (
          <button
            onClick={() => onRatingChange(null)}
            className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Rating List */}
      <div className="space-y-1.5">
        {RATING_OPTIONS.map((opt) => {
          const isSelected = selectedRating === opt.stars;

          return (
            <button
              key={opt.stars}
              type="button"
              onClick={() => onRatingChange(isSelected ? null : opt.stars)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 flex items-center justify-between cursor-pointer border",
                isSelected
                  ? "bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800 font-semibold"
                  : "bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  className="rounded border-slate-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                />
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3.5 w-3.5",
                        i < opt.stars
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-200 dark:text-slate-700 fill-slate-200 dark:fill-slate-700"
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium ml-1">{opt.label}</span>
              </div>

              <span className="text-[11px] font-semibold text-slate-400">
                ({opt.count.toLocaleString("en-IN")})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
