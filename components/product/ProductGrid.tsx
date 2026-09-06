"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2 } from "lucide-react";
import { getAllProducts, MOCK_PRODUCTS } from "@/lib/db/products";
import { ProductCard } from "@/components/product/ProductCard";
import { NoProductAvailable } from "@/components/product/NoProductAvailable";

export interface ProductGridProps {
  selectedTab: string;
}

export function ProductGrid({ selectedTab }: ProductGridProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      try {
        const allProducts = await getAllProducts();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let filtered = allProducts;
        const tab = selectedTab.toLowerCase();
        if (tab !== "all") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          filtered = allProducts.filter((p: any) => {
            const cat = (typeof p.category === "string" ? p.category : p.category?.name || p.categories?.name || "").toLowerCase();
            const slug = (p.categories?.slug || "").toLowerCase();
            const name = (p.name || p.title || "").toLowerCase();
            if (tab === "air-conditioners") return cat.includes("air conditioner") || slug.includes("air-conditioner") || name.includes("air conditioner") || name.includes("ac ");
            if (tab === "smartphones") return cat.includes("smartphone") || slug.includes("smartphone");
            if (tab === "tablets-ipads") return cat.includes("tablet") || slug.includes("tablet") || cat.includes("ipad");
            if (tab === "accessories") return cat.includes("cable") || cat.includes("charger") || cat.includes("power bank") || cat.includes("accessories");
            return cat.includes(tab) || slug.includes(tab);
          });
        }
        if (isMounted) {
          setProducts(filtered);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setProducts(MOCK_PRODUCTS);
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [selectedTab]);

  return (
    <div className="mt-6">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="text-xs font-semibold text-slate-500 tracking-wide capitalize">
            Loading {selectedTab} electronics...
          </span>
        </div>
      ) : products.length === 0 ? (
        <NoProductAvailable selectedTab={selectedTab} />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0.2, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4"
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
    </div>
  );
}
