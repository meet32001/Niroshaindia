"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2 } from "lucide-react";
import { client } from "@/sanity/lib/client";
import { MOCK_PRODUCTS } from "@/sanity/lib/mockData";
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
        const query = `*[_type == "product" && (productType == $variant || variant == $variant)] | order(name asc) {
          _id,
          name,
          slug,
          images,
          description,
          price,
          discount,
          stock,
          status,
          productType,
          isFeatured
        }`;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await client.fetch<any[]>(query, {
          variant: selectedTab.toLowerCase(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setProducts(data);
          } else {
            // Local fallback filter during development
            const tabLower = selectedTab.toLowerCase();
            const fallback = MOCK_PRODUCTS.filter((p) => {
              if (tabLower === "gadget") return p.category.toLowerCase().includes("gadget") || p.category.toLowerCase().includes("accessories");
              if (tabLower === "appliances") return p.category.toLowerCase().includes("appliance");
              if (tabLower === "refrigerators") return p.category.toLowerCase().includes("refrigerator");
              return true;
            });
            setProducts(fallback);
          }
        }
      } catch {
        if (isMounted) {
          // Clean fallback error handler
          const tabLower = selectedTab.toLowerCase();
          const fallback = MOCK_PRODUCTS.filter((p) => {
            if (tabLower === "gadget") return p.category.toLowerCase().includes("gadget") || p.category.toLowerCase().includes("accessories");
            if (tabLower === "appliances") return p.category.toLowerCase().includes("appliance");
            if (tabLower === "refrigerators") return p.category.toLowerCase().includes("refrigerator");
            return true;
          });
          setProducts(fallback);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [selectedTab]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-shop-orange" />
        <span className="text-xs font-semibold text-slate-500 tracking-wide">
          Loading {selectedTab} products...
        </span>
      </div>
    );
  }

  if (products.length === 0) {
    return <NoProductAvailable selectedTab={selectedTab} />;
  }

  return (
    <div className="mt-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0.2, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4"
        >
          {products.map((product, index) => (
            <motion.div
              key={product._id || product.id || index}
              layout
              initial={{ opacity: 0.2 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
            >
              <ProductCard {...product} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
