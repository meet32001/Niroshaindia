"use client";

import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown, ChevronRight, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CategoryItem {
  id?: string | number;
  _id?: string | number;
  name?: string;
  title?: string;
  slug?: string | { current?: string };
  productCount?: number;
  parent_id?: string | number | null;
  children?: CategoryItem[];
}

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
  // State to track which parent categories are expanded
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});

  // Automatically expand parent if the selectedCategory matches the parent or any child
  useEffect(() => {
    if (!selectedCategory) return;
    const normSelected = selectedCategory.toLowerCase();

    categories.forEach((cat) => {
      const rawParentSlug = typeof cat.slug === "string" ? cat.slug : cat.slug?.current;
      const parentSlug = (rawParentSlug || cat.name || "").toLowerCase();
      const parentKey = String(cat.id || parentSlug);

      if (parentSlug === normSelected) {
        setExpandedParents((prev) => ({ ...prev, [parentKey]: true }));
        return;
      }

      if (Array.isArray(cat.children)) {
        const matchesChild = cat.children.some((child: CategoryItem) => {
          const rawChildSlug = typeof child.slug === "string" ? child.slug : child.slug?.current;
          const childSlug = (rawChildSlug || child.name || "").toLowerCase();
          return childSlug === normSelected;
        });

        if (matchesChild) {
          setExpandedParents((prev) => ({ ...prev, [parentKey]: true }));
        }
      }
    });
  }, [selectedCategory, categories]);

  const toggleExpand = (parentKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedParents((prev) => ({
      ...prev,
      [parentKey]: !prev[parentKey],
    }));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-emerald-600" />
          <span>Categories</span>
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

      <div className="space-y-1.5">
        {categories.map((cat, idx) => {
          const rawParentSlug = typeof cat.slug === "string" ? cat.slug : cat.slug?.current;
          const parentSlug = rawParentSlug || "category";
          const parentName = cat.name || cat.title || "Category";
          const parentKey = String(cat.id || idx);

          const isParentActive = selectedCategory?.toLowerCase() === parentSlug.toLowerCase();
          const hasChildren = Array.isArray(cat.children) && cat.children.length > 0;
          const isExpanded = Boolean(expandedParents[parentKey]);

          // Check if any child of this parent is currently selected
          const isAnyChildActive = hasChildren && cat.children.some((child: CategoryItem) => {
            const rawChildSlug = typeof child.slug === "string" ? child.slug : child.slug?.current;
            return rawChildSlug?.toLowerCase() === selectedCategory?.toLowerCase();
          });

          return (
            <div key={parentKey} className="flex flex-col">
              {/* Parent Department Row */}
              <div
                onClick={() => {
                  if (isParentActive) {
                    setSelectedCategory(null);
                  } else {
                    setSelectedCategory(parentSlug);
                    if (hasChildren && !isExpanded) {
                      setExpandedParents((prev) => ({ ...prev, [parentKey]: true }));
                    }
                  }
                }}
                className={cn(
                  "group flex items-center justify-between px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-all duration-200 cursor-pointer border select-none",
                  isParentActive
                    ? "bg-emerald-600 text-white border-emerald-600 font-semibold shadow-xs"
                    : isAnyChildActive
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 font-semibold"
                    : "border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                )}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                  <span className="truncate">{parentName}</span>
                  {cat.productCount !== undefined && (
                    <span
                      className={cn(
                        "text-[10px] font-bold shrink-0",
                        isParentActive ? "text-white/85" : "text-slate-400"
                      )}
                    >
                      ({cat.productCount})
                    </span>
                  )}
                </div>

                {hasChildren && (
                  <button
                    type="button"
                    onClick={(e) => toggleExpand(parentKey, e)}
                    aria-label={isExpanded ? "Collapse subcategories" : "Expand subcategories"}
                    className={cn(
                      "p-1 rounded-md transition-colors cursor-pointer shrink-0 ml-1",
                      isParentActive
                        ? "text-white/80 hover:bg-white/20 hover:text-white"
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
                    )}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>

              {/* Subcategories Accordion Content */}
              {hasChildren && isExpanded && (
                <div className="ml-3.5 pl-2.5 my-1.5 border-l-2 border-slate-200/80 dark:border-slate-800 space-y-1 animate-in fade-in-50 duration-150">
                  {cat.children.map((child: CategoryItem, cIdx: number) => {
                    const rawChildSlug =
                      typeof child.slug === "string" ? child.slug : child.slug?.current;
                    const childSlug = rawChildSlug || "subcategory";
                    const childName = child.name || child.title || "Subcategory";
                    const isChildActive =
                      selectedCategory?.toLowerCase() === childSlug.toLowerCase();

                    return (
                      <button
                        key={child.id || cIdx}
                        type="button"
                        onClick={() => setSelectedCategory(isChildActive ? null : childSlug)}
                        className={cn(
                          "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center justify-between cursor-pointer",
                          isChildActive
                            ? "bg-emerald-600 text-white font-semibold shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        )}
                      >
                        <span className="truncate pr-1">{childName}</span>
                        {child.productCount !== undefined && (
                          <span
                            className={cn(
                              "text-[10px] shrink-0 font-bold",
                              isChildActive ? "text-white/90" : "text-slate-400"
                            )}
                          >
                            ({child.productCount})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
