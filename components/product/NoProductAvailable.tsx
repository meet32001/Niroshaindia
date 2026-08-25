"use client";

import { motion } from "motion/react";
import { PackageSearch } from "lucide-react";
import { Title, SubText } from "@/components/ui/text";

export interface NoProductAvailableProps {
  selectedTab?: string;
  className?: string;
}

export function NoProductAvailable({ selectedTab, className }: NoProductAvailableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center p-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 my-8 space-y-4 max-w-xl mx-auto ${className || ""}`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-shop-orange/10 text-shop-orange">
        <PackageSearch className="h-8 w-8" />
      </div>

      <div className="space-y-1.5">
        <Title className="text-xl font-bold text-slate-800 dark:text-slate-100">
          No Products Currently Available
        </Title>
        <SubText className="text-xs text-slate-500 max-w-md">
          {selectedTab
            ? `We currently don't have active stock under the "${selectedTab}" category. New inventory will be updated shortly.`
            : "No products match the selected criteria. Please check back soon or browse other categories."}
        </SubText>
      </div>
    </motion.div>
  );
}
