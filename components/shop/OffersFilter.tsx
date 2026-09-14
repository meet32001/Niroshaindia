"use client";

import React from "react";
import { CreditCard, BadgePercent, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OffersFilterProps {
  inStockOnly: boolean;
  bankDiscount: boolean;
  noCostEmi: boolean;
  onOfferToggle: (key: "inStockOnly" | "bankDiscount" | "noCostEmi") => void;
  onResetOffers: () => void;
  inStockCount?: number;
  bankDiscountCount?: number;
  noCostEmiCount?: number;
}

export function OffersFilter({
  inStockOnly,
  bankDiscount,
  noCostEmi,
  onOfferToggle,
  onResetOffers,
  inStockCount = 5562,
  bankDiscountCount = 3551,
  noCostEmiCount = 4445,
}: OffersFilterProps) {
  const hasActiveOffer = inStockOnly || bankDiscount || noCostEmi;

  const OFFER_ITEMS = [
    {
      id: "inStockOnly" as const,
      label: "In Stock Only",
      subtitle: "Ready for express dispatch",
      active: inStockOnly,
      count: inStockCount,
      icon: (
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      ),
    },
    {
      id: "bankDiscount" as const,
      label: "Instant Bank Discount",
      subtitle: "Orders ₹10,000+ eligible",
      active: bankDiscount,
      count: bankDiscountCount,
      icon: <CreditCard className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />,
    },
    {
      id: "noCostEmi" as const,
      label: "No Cost EMI Available",
      subtitle: "Orders ₹3,000+ eligible",
      active: noCostEmi,
      count: noCostEmiCount,
      icon: <BadgePercent className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" />,
    },
  ];

  return (
    <div className="space-y-3 pt-4 border-t border-slate-200/80 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
          Availability & Offers
        </h3>
        {hasActiveOffer && (
          <button
            onClick={onResetOffers}
            className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Offers Checklist */}
      <div className="space-y-1.5">
        {OFFER_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onOfferToggle(item.id)}
            className={cn(
              "w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center justify-between cursor-pointer border",
              item.active
                ? "bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800 font-semibold"
                : "bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <div className="flex items-start gap-2.5">
              <div className="pt-0.5">
                <input
                  type="checkbox"
                  checked={item.active}
                  onChange={() => {}}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  {item.icon}
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                    {item.label}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                  {item.subtitle}
                </p>
              </div>
            </div>

            <span className="text-[10px] font-semibold text-slate-400 shrink-0 self-center">
              ({item.count.toLocaleString("en-IN")})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
