"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, RotateCcw } from "lucide-react";
import { Title } from "@/components/ui/text";
import { CategoryList } from "@/components/shop/CategoryList";
import { BrandList } from "@/components/shop/BrandList";
import { PriceList } from "@/components/shop/PriceList";
import { ProductCard } from "@/components/product/ProductCard";
import { NoProductAvailable } from "@/components/product/NoProductAvailable";
import { getAllProducts, MOCK_PRODUCTS } from "@/lib/db/products";

export interface ShopProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  brands: any[];
}

export function Shop({ categories, brands }: ShopProps) {
  const searchParams = useSearchParams();

  // Active filter state initialized with search params
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get("category"));
  const [selectedBrand, setSelectedBrand] = useState<string | null>(searchParams.get("brand"));
  const [selectedPrice, setSelectedPrice] = useState<string | null>(searchParams.get("price"));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadFilteredProducts() {
      setLoading(true);
      try {
        const rawProducts = await getAllProducts();
        let filtered = [...(rawProducts.length > 0 ? rawProducts : MOCK_PRODUCTS)];

        if (selectedCategory) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          filtered = filtered.filter((p: any) => {
            const catStr = typeof p.category === "string" ? p.category : p.category?.slug?.current || p.productType || "";
            return catStr.toLowerCase().includes(selectedCategory.toLowerCase());
          });
        }

        if (selectedBrand) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          filtered = filtered.filter((p: any) => {
            const brandStr = typeof p.brand === "string" ? p.brand : p.brand?.slug?.current || "";
            return brandStr.toLowerCase().includes(selectedBrand.toLowerCase());
          });
        }

        if (selectedPrice) {
          const parts = selectedPrice.split("-").map(Number);
          if (parts.length === 2) {
            const minPrice = parts[0];
            const maxPrice = parts[1];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            filtered = filtered.filter((p: any) => {
              const price = p.price || 0;
              return price >= minPrice && price <= maxPrice;
            });
          }
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

    loadFilteredProducts();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, selectedBrand, selectedPrice]);

  const handleResetFilters = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSelectedPrice(null);
  };

  const hasActiveFilters = Boolean(selectedCategory || selectedBrand || selectedPrice);

  return (
    <div className="space-y-6">
      {/* Header & Reset Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <Title className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Storefront Catalog
          </Title>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Discover premier consumer electronics, flagship audio, smart laptops, and IoT appliances.
          </p>
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>

      {/* Main Grid: Left Filters Sidebar & Right Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Filters Sidebar */}
        <aside className="lg:col-span-1 space-y-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <CategoryList
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          <BrandList
            brands={brands}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
          />

          <PriceList
            selectedPrice={selectedPrice}
            setSelectedPrice={setSelectedPrice}
          />
        </aside>

        {/* Right Products Section */}
        <main className="lg:col-span-3 min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <span className="text-xs font-semibold text-slate-500 tracking-wide">
                Filtering catalog inventory...
              </span>
            </div>
          ) : products.length === 0 ? (
            <NoProductAvailable selectedTab="selected filters" />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedCategory}-${selectedBrand}-${selectedPrice}`}
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
    </div>
  );
}
