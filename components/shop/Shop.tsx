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
import { client } from "@/sanity/lib/client";
import { MOCK_PRODUCTS } from "@/sanity/lib/mockData";

export interface ShopProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  brands: any[];
}

export function Shop({ categories, brands }: ShopProps) {
  const searchParams = useSearchParams();

  // Search Parameter Hydration on Initial State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    () => searchParams.get("category")
  );
  const [selectedBrand, setSelectedBrand] = useState<string | null>(
    () => searchParams.get("brand")
  );
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Reactive Multi-Facet Product Fetching
  useEffect(() => {
    let isMounted = true;

    async function fetchFilteredProducts() {
      try {
        let minPrice: number | undefined;
        let maxPrice: number | undefined;

        if (selectedPrice) {
          const parts = selectedPrice.split("-").map(Number);
          if (parts.length === 2) {
            minPrice = parts[0];
            maxPrice = parts[1];
          }
        }

        const query = `*[_type == "product"
          && (!defined($category) || references(*[_type == "category" && slug.current == $category]._id))
          && (!defined($brand) || references(*[_type == "brand" && slug.current == $brand]._id))
          && (!defined($minPrice) || price >= $minPrice)
          && (!defined($maxPrice) || price <= $maxPrice)
        ] | order(name asc) {
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
          isFeatured,
          "categories": categories[]->title
        }`;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await client.fetch<any[]>(query, {
          category: selectedCategory || undefined,
          brand: selectedBrand || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setProducts(data);
          } else {
            // Local fallback filtering logic during development
            let fallback = [...MOCK_PRODUCTS];

            if (selectedCategory) {
              const catLower = selectedCategory.toLowerCase();
              fallback = fallback.filter(
                (p) =>
                  p.category.toLowerCase().includes(catLower) ||
                  p.slug.toLowerCase().includes(catLower)
              );
            }

            if (selectedBrand) {
              const brandLower = selectedBrand.toLowerCase();
              fallback = fallback.filter((p) =>
                p.brand.toLowerCase().includes(brandLower)
              );
            }

            if (selectedPrice) {
              const [min, max] = selectedPrice.split("-").map(Number);
              fallback = fallback.filter(
                (p) => p.price >= min && p.price <= max
              );
            }

            setProducts(fallback);
          }
        }
      } catch {
        if (isMounted) {
          let fallback = [...MOCK_PRODUCTS];

          if (selectedCategory) {
            const catLower = selectedCategory.toLowerCase();
            fallback = fallback.filter(
              (p) =>
                p.category.toLowerCase().includes(catLower) ||
                p.slug.toLowerCase().includes(catLower)
            );
          }

          if (selectedBrand) {
            const brandLower = selectedBrand.toLowerCase();
            fallback = fallback.filter((p) =>
              p.brand.toLowerCase().includes(brandLower)
            );
          }

          if (selectedPrice) {
            const [min, max] = selectedPrice.split("-").map(Number);
            fallback = fallback.filter(
              (p) => p.price >= min && p.price <= max
            );
          }

          setProducts(fallback);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchFilteredProducts();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, selectedBrand, selectedPrice]);

  const hasActiveFilters = Boolean(
    selectedCategory || selectedBrand || selectedPrice
  );

  const resetAllFilters = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSelectedPrice(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <Title className="text-lg md:text-xl font-bold">
          Get the products as your needs
        </Title>

        {hasActiveFilters && (
          <button
            onClick={resetAllFilters}
            className="border border-shop-orange text-shop-orange hover:bg-shop-orange hover:text-white px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Two-Column Layout */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left Sidebar */}
        <aside className="w-full md:w-64 shrink-0 md:sticky md:top-20 md:h-[calc(100vh-140px)] md:overflow-y-auto no-scrollbar md:border-r md:border-slate-200 dark:md:border-slate-800 md:pr-5 space-y-6">
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

        {/* Right Product Grid Area */}
        <main className="flex-1 w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 min-h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-shop-orange" />
              <span className="text-xs font-semibold text-slate-500 tracking-wide">
                Filtering store catalog...
              </span>
            </div>
          ) : products.length === 0 ? (
            <NoProductAvailable selectedTab="custom filters" />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedCategory}-${selectedBrand}-${selectedPrice}`}
                initial={{ opacity: 0.2, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
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
