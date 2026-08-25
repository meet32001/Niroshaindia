"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Loader2 } from "lucide-react";
import { Category } from "@/types";
import { getProductsByCategory } from "@/sanity/lib/queries";
import { ProductCard } from "@/components/product/ProductCard";
import { NoProductAvailable } from "@/components/product/NoProductAvailable";
import { cn } from "@/lib/utils";

export interface CategoryProductsProps {
  categories: Category[];
  initialSlug: string;
}

export function CategoryProducts({ categories, initialSlug }: CategoryProductsProps) {
  const router = useRouter();
  const [currentSlug, setCurrentSlug] = useState(initialSlug);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadCategoryProducts() {
      const data = await getProductsByCategory(currentSlug);
      if (isMounted) {
        setProducts(data);
        setLoading(false);
      }
    }

    loadCategoryProducts();

    return () => {
      isMounted = false;
    };
  }, [currentSlug]);

  const handleCategorySelect = (catSlug: string) => {
    if (catSlug === currentSlug) return;
    setLoading(true);
    setCurrentSlug(catSlug);
    router.push(`/category/${catSlug}`, { scroll: false });
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 mt-6 items-start">
      {/* Left Sidebar */}
      <aside className="w-full md:w-60 shrink-0 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
          Categories
        </h4>
        <div className="flex flex-col gap-1.5">
          {categories.map((cat, idx) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rawSlug = typeof cat.slug === "string" ? cat.slug : (cat.slug as any)?.current;
            const catSlug = rawSlug || "category";
            const isActive = currentSlug.toLowerCase() === catSlug.toLowerCase();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const catKey = cat.id || (cat as any)._id || catSlug || idx;

            return (
              <button
                key={catKey}
                onClick={() => handleCategorySelect(catSlug)}
                className={cn(
                  "w-full text-left px-3.5 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 flex items-center justify-between cursor-pointer",
                  isActive
                    ? "bg-shop-orange text-white font-semibold shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800"
                )}
              >
                <span className="line-clamp-1">{cat.title}</span>
                {cat.productCount !== undefined && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    )}
                  >
                    {cat.productCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Right Product Area */}
      <main className="flex-1 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-shop-orange" />
            <span className="text-xs font-semibold text-slate-500 tracking-wide capitalize">
              Loading {currentSlug.replace(/-/g, " ")} items...
            </span>
          </div>
        ) : products.length === 0 ? (
          <NoProductAvailable selectedTab={currentSlug.replace(/-/g, " ")} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlug}
              initial={{ opacity: 0.2, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
            >
              {products.map((product, index) => (
                <motion.div
                  key={product._id || product.id || index}
                  layout
                  initial={{ opacity: 0.2 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <ProductCard {...product} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
