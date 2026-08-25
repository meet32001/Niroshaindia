"use client";

import { useState } from "react";
import { ChevronDown, ShieldCheck, Check, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProductCharacteristicsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product: any;
}

export function ProductCharacteristics({ product }: ProductCharacteristicsProps) {
  const [isOpen, setIsOpen] = useState(true);

  const brand = typeof product.brand === "string"
    ? product.brand
    : product.brand?.title || "Nirosha Electronics";

  const categories = Array.isArray(product.categories)
    ? product.categories.join(", ")
    : typeof product.category === "string"
    ? product.category
    : product.productType || "Gadgets & Electronics";

  const stock = product.stock !== undefined ? product.stock : 10;
  const stockText = stock > 0 ? `Available (${stock} units)` : "Out of Stock";

  const SPECS = [
    { label: "Brand", value: brand },
    { label: "Category", value: categories },
    { label: "Stock Availability", value: stockText },
    { label: "Warranty", value: "1 Year Manufacturer Domestic Warranty" },
    { label: "Dispatch", value: "Fast Express Shipping within 24 Hours" },
  ];

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 mt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between font-semibold text-sm text-shop-dark dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-shop-orange" />
          <span>Product Characteristics & Specifications</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-400 transition-transform duration-300",
            isOpen && "rotate-180 text-shop-orange"
          )}
        />
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs space-y-3">
          {SPECS.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-2 gap-4 py-1.5 border-b border-slate-100 dark:border-slate-800/60 last:border-0"
            >
              <span className="font-semibold text-slate-500">{item.label}</span>
              <span className="font-medium text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                {item.label === "Warranty" && <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                {item.label === "Dispatch" && <Check className="h-3.5 w-3.5 text-shop-orange shrink-0" />}
                <span>{item.value}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
