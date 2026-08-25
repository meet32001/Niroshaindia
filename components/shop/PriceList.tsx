"use client";

import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PriceListProps {
  selectedPrice: string | null;
  setSelectedPrice: (price: string | null) => void;
}

export function PriceList({
  selectedPrice,
  setSelectedPrice,
}: PriceListProps) {
  const PRICE_BRACKETS = [
    { title: "Under ₹10,000", value: "0-10000" },
    { title: "₹10,000 to ₹25,000", value: "10000-25000" },
    { title: "₹25,000 to ₹50,000", value: "25000-50000" },
    { title: "₹50,000 to ₹1,00,000", value: "50000-100000" },
    { title: "Over ₹1,00,000", value: "100000-1000000" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-shop-dark dark:text-slate-100 uppercase tracking-wider">
          Price Range
        </h3>
        {selectedPrice && (
          <button
            onClick={() => setSelectedPrice(null)}
            className="text-[11px] font-semibold text-shop-orange hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        {PRICE_BRACKETS.map((bracket) => {
          const isActive = selectedPrice === bracket.value;

          return (
            <button
              key={bracket.value}
              onClick={() => setSelectedPrice(isActive ? null : bracket.value)}
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
                <span className="line-clamp-1">{bracket.title}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
