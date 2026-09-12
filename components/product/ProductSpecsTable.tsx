"use client";

import React, { useState } from "react";
import { ChevronDown, Search, ShieldCheck, Check, Cpu, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProductSpecsTableProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  specs?: Record<string, any> | null;
  brand?: string;
  category?: string;
  sku?: string;
  className?: string;
}

export function ProductSpecsTable({
  specs = {},
  brand = "Nirosha",
  category = "Electronics",
  sku,
  className,
}: ProductSpecsTableProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const rawSpecs = specs || {};
  const entries = Object.entries(rawSpecs).filter(
    ([k, v]) => k && v !== undefined && v !== null && String(v).trim() !== ""
  );

  // Fallback defaults if no scraped specs are present
  const defaultSpecs: { key: string; value: string }[] = [
    { key: "Brand", value: brand },
    { key: "Category", value: category },
    ...(sku ? [{ key: "Model / SKU", value: sku }] : []),
    { key: "Warranty", value: "1 Year Official Domestic Brand Warranty" },
    { key: "Shipping", value: "Express Delivery within 24–48 Hours across India" },
    { key: "Return Policy", value: "7 Days Replacement for Technical Defects" },
  ];

  const allEntries: { key: string; value: string }[] =
    entries.length > 0
      ? entries.map(([k, v]) => ({ key: k, value: String(v) }))
      : defaultSpecs;

  const filteredEntries = allEntries.filter(
    (item) =>
      item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={cn(
        "border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs",
        className
      )}
    >
      {/* Header Accordion Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between font-bold text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-shop-orange/10 text-shop-orange flex items-center justify-center">
            <Cpu className="h-4 w-4" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
              Technical Specifications
            </h3>
            <p className="text-[11px] text-slate-500 font-normal">
              {allEntries.length} verified hardware & system parameters
            </p>
          </div>
        </div>

        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-400 transition-transform duration-300",
            isOpen && "rotate-180 text-shop-orange"
          )}
        />
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
          {/* Search Filter if more than 6 specs */}
          {allEntries.length > 6 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter specifications (e.g. RAM, Display, Processor)..."
                className="w-full pl-8.5 pr-4 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-shop-orange/20"
              />
            </div>
          )}

          {/* Specifications Table */}
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden text-xs">
            {filteredEntries.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-xs">
                No specifications match &quot;{searchQuery}&quot;
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredEntries.map(({ key, value }, idx) => {
                  const isHighlight =
                    key.toLowerCase().includes("processor") ||
                    key.toLowerCase().includes("ram") ||
                    key.toLowerCase().includes("storage") ||
                    key.toLowerCase().includes("display") ||
                    key.toLowerCase().includes("graphics");

                  return (
                    <div
                      key={idx}
                      className={cn(
                        "grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 px-4 py-2.5 transition-colors",
                        idx % 2 === 0 ? "bg-slate-50/50 dark:bg-slate-900/40" : "bg-white dark:bg-slate-900",
                        isHighlight && "bg-orange-50/30 dark:bg-orange-950/15"
                      )}
                    >
                      <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        {isHighlight && <Sparkles className="w-3 h-3 text-shop-orange shrink-0" />}
                        <span>{key}</span>
                      </span>
                      <span className="sm:col-span-2 font-medium text-slate-900 dark:text-slate-200 break-words leading-relaxed">
                        {key.toLowerCase().includes("warranty") ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                            <span>{value}</span>
                          </span>
                        ) : key.toLowerCase().includes("dispatch") || key.toLowerCase().includes("shipping") ? (
                          <span className="inline-flex items-center gap-1.5 text-shop-orange">
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            <span>{value}</span>
                          </span>
                        ) : (
                          value
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
