"use client";

import { useState, useEffect, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Loader2,
  RotateCcw,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { Title } from "@/components/ui/text";
import { CategoryList } from "@/components/shop/CategoryList";
import { BrandList } from "@/components/shop/BrandList";
import { PriceFilter } from "@/components/shop/PriceFilter";
import { RatingFilter } from "@/components/shop/RatingFilter";
import { OffersFilter } from "@/components/shop/OffersFilter";
import { ProductCard } from "@/components/product/ProductCard";
import { NoProductAvailable } from "@/components/product/NoProductAvailable";
import { getShopCatalog, getContextualBrands, ShopCatalogResult } from "@/lib/db/products";

export interface ShopProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  brands: any[];
}

export function Shop({ categories, brands }: ShopProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Read URL search params
  const searchQuery = searchParams.get("search") || searchParams.get("q") || "";
  const selectedCategory = searchParams.get("category");
  const selectedBrand = searchParams.get("brand");
  const selectedPrice = searchParams.get("price");
  const minPriceParam = searchParams.get("min_price");
  const maxPriceParam = searchParams.get("max_price");
  const ratingParam = searchParams.get("rating");
  const inStockParam = searchParams.get("in_stock");
  const bankDiscountParam = searchParams.get("bank_discount");
  const noCostEmiParam = searchParams.get("no_cost_emi");
  const selectedSort = searchParams.get("sort") || "newest";
  const currentPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  // Resolved Price Range (supporting both min_price/max_price and legacy price=min-max)
  let minPrice: number | null = minPriceParam ? parseInt(minPriceParam, 10) : null;
  let maxPrice: number | null = maxPriceParam ? parseInt(maxPriceParam, 10) : null;
  if (minPrice === null && maxPrice === null && selectedPrice) {
    const parts = selectedPrice.split("-").map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      minPrice = parts[0];
      maxPrice = parts[1];
    }
  }

  // Resolved Rating & Offers
  const selectedRating = ratingParam ? parseInt(ratingParam, 10) : null;
  const inStockOnly = inStockParam === "true";
  const bankDiscount = bankDiscountParam === "true";
  const noCostEmi = noCostEmiParam === "true";

  // Contextual Brands State
  const [currentBrands, setCurrentBrands] = useState(brands);

  useEffect(() => {
    let isMounted = true;
    async function loadContextualBrands() {
      try {
        const contextual = await getContextualBrands(selectedCategory);
        if (isMounted) {
          if (contextual && contextual.length > 0) {
            setCurrentBrands(contextual);
          } else if (!selectedCategory) {
            setCurrentBrands(brands);
          }
        }
      } catch (err) {
        console.error("Contextual brands fetch error:", err);
      }
    }

    loadContextualBrands();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, brands]);

  // Catalog State
  const [catalog, setCatalog] = useState<ShopCatalogResult>({
    products: [],
    totalCount: 0,
    page: currentPage,
    pageSize: 24,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Helper to update URL search parameters cleanly
  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === undefined || val === "") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    // Reset to page 1 whenever any filter other than page changes
    if (!("page" in updates)) {
      params.delete("page");
    }

    startTransition(() => {
      const qs = params.toString();
      router.push(`/shop${qs ? `?${qs}` : ""}`, { scroll: false });
    });
  };

  // Fetch live products from Supabase whenever URL params change
  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      setLoading(true);
      try {
        const result = await getShopCatalog({
          category: selectedCategory,
          brand: selectedBrand,
          minPrice: minPrice,
          maxPrice: maxPrice,
          rating: selectedRating,
          inStockOnly,
          bankDiscount,
          noCostEmi,
          search: searchQuery || null,
          sort: selectedSort,
          page: currentPage,
          pageSize: 24,
        });

        if (isMounted) {
          setCatalog(result);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load catalog:", err);
        if (isMounted) {
          setCatalog({
            products: [],
            totalCount: 0,
            page: 1,
            pageSize: 24,
            totalPages: 1,
          });
          setLoading(false);
        }
      }
    }

    loadCatalog();

    return () => {
      isMounted = false;
    };
  }, [
    searchQuery,
    selectedCategory,
    selectedBrand,
    minPrice,
    maxPrice,
    selectedRating,
    inStockOnly,
    bankDiscount,
    noCostEmi,
    selectedSort,
    currentPage,
  ]);

  const handlePriceChange = (min: number | null, max: number | null) => {
    updateParams({
      min_price: min !== null ? min.toString() : null,
      max_price: max !== null ? max.toString() : null,
      price: null,
    });
  };

  const handleRatingChange = (rating: number | null) => {
    updateParams({
      rating: rating !== null ? rating.toString() : null,
    });
  };

  const handleOfferToggle = (key: "inStockOnly" | "bankDiscount" | "noCostEmi") => {
    if (key === "inStockOnly") {
      updateParams({ in_stock: inStockOnly ? null : "true" });
    } else if (key === "bankDiscount") {
      updateParams({ bank_discount: bankDiscount ? null : "true" });
    } else if (key === "noCostEmi") {
      updateParams({ no_cost_emi: noCostEmi ? null : "true" });
    }
  };

  const handleResetOffers = () => {
    updateParams({
      in_stock: null,
      bank_discount: null,
      no_cost_emi: null,
    });
  };

  const handleResetFilters = () => {
    startTransition(() => {
      router.push("/shop", { scroll: false });
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= catalog.totalPages && newPage !== currentPage) {
      updateParams({ page: newPage.toString() });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const hasActiveFilters = Boolean(
    searchQuery ||
      selectedCategory ||
      selectedBrand ||
      selectedPrice ||
      minPrice !== null ||
      maxPrice !== null ||
      selectedRating !== null ||
      inStockOnly ||
      bankDiscount ||
      noCostEmi ||
      (selectedSort && selectedSort !== "newest")
  );

  const startItem = catalog.totalCount === 0 ? 0 : (catalog.page - 1) * catalog.pageSize + 1;
  const endItem = Math.min(catalog.page * catalog.pageSize, catalog.totalCount);

  // Active brand list for tags
  const activeBrandList = selectedBrand
    ? selectedBrand.split(",").map((b) => b.trim()).filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <Title className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Storefront Catalog
          </Title>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Browse genuine consumer electronics, laptops, mobiles, and home appliances directly from our inventory.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Filters {hasActiveFilters && "•"}</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Sort:</span>
            <select
              value={selectedSort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="alpha">Alphabetical (A-Z)</option>
            </select>
          </div>

          {/* Reset Action */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900 transition-all cursor-pointer shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset All</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-medium">Active Filters:</span>

          {searchQuery && (
            <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full font-medium">
              <Search className="h-3 w-3" />
              <span>&quot;{searchQuery}&quot;</span>
              <button
                onClick={() => updateParams({ search: null, q: null })}
                className="hover:text-emerald-900 cursor-pointer ml-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {selectedCategory && (
            <span className="inline-flex items-center gap-1 bg-green-50 dark:bg-green-950/50 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800 px-2.5 py-1 rounded-full font-medium capitalize">
              <span>Category: {selectedCategory.replace(/-/g, " ")}</span>
              <button
                onClick={() => updateParams({ category: null })}
                className="hover:text-green-900 cursor-pointer ml-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {activeBrandList.map((b) => (
            <span
              key={b}
              className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-full font-medium uppercase text-[11px]"
            >
              <span>{b}</span>
              <button
                onClick={() => {
                  const updated = activeBrandList.filter((x) => x !== b);
                  updateParams({ brand: updated.length > 0 ? updated.join(",") : null });
                }}
                className="hover:text-blue-900 cursor-pointer ml-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {(minPrice !== null || maxPrice !== null) && (
            <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-full font-medium">
              <span>
                {minPrice !== null && maxPrice !== null
                  ? `₹${minPrice.toLocaleString("en-IN")} – ₹${maxPrice.toLocaleString("en-IN")}`
                  : minPrice !== null
                  ? `Above ₹${minPrice.toLocaleString("en-IN")}`
                  : `Under ₹${maxPrice?.toLocaleString("en-IN")}`}
              </span>
              <button
                onClick={() => updateParams({ min_price: null, max_price: null, price: null })}
                className="hover:text-amber-900 dark:hover:text-amber-100 cursor-pointer ml-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {selectedRating && (
            <span className="inline-flex items-center gap-1 bg-yellow-50 dark:bg-yellow-950/50 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 px-2.5 py-1 rounded-full font-medium">
              <span>{selectedRating}★ & above</span>
              <button
                onClick={() => updateParams({ rating: null })}
                className="hover:text-yellow-900 dark:hover:text-yellow-100 cursor-pointer ml-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {inStockOnly && (
            <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-0.5"></span>
              <span>In Stock Only</span>
              <button
                onClick={() => updateParams({ in_stock: null })}
                className="hover:text-emerald-900 dark:hover:text-emerald-100 cursor-pointer ml-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {bankDiscount && (
            <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-full font-medium">
              <span>Instant Bank Discount</span>
              <button
                onClick={() => updateParams({ bank_discount: null })}
                className="hover:text-blue-900 dark:hover:text-blue-100 cursor-pointer ml-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {noCostEmi && (
            <span className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2.5 py-1 rounded-full font-medium">
              <span>No Cost EMI</span>
              <button
                onClick={() => updateParams({ no_cost_emi: null })}
                className="hover:text-purple-900 dark:hover:text-purple-100 cursor-pointer ml-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Main Grid: Sidebar + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Filters Sidebar (Desktop + Collapsible Mobile) */}
        <aside
          className={`${
            mobileFilterOpen ? "block" : "hidden"
          } lg:block lg:col-span-1 space-y-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs`}
        >
          <CategoryList
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={(cat) => updateParams({ category: cat })}
          />

          <BrandList
            brands={currentBrands}
            selectedBrand={selectedBrand}
            setSelectedBrand={(brand) => updateParams({ brand })}
          />

          <PriceFilter
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={handlePriceChange}
          />

          <RatingFilter
            selectedRating={selectedRating}
            onRatingChange={handleRatingChange}
            totalProductsCount={catalog.totalCount > 0 ? catalog.totalCount : 5562}
          />

          <OffersFilter
            inStockOnly={inStockOnly}
            bankDiscount={bankDiscount}
            noCostEmi={noCostEmi}
            onOfferToggle={handleOfferToggle}
            onResetOffers={handleResetOffers}
          />
        </aside>

        {/* Right Product Grid & Pagination */}
        <main className="lg:col-span-3 min-h-[450px] flex flex-col justify-between">
          {/* Item Count & Current Range */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-4">
            <span>
              Showing <strong className="text-slate-800 dark:text-slate-200 font-bold">{startItem}–{endItem}</strong> of{" "}
              <strong className="text-slate-800 dark:text-slate-200 font-bold">
                {catalog.totalCount.toLocaleString()}
              </strong>{" "}
              products
            </span>
            {catalog.totalPages > 1 && (
              <span>
                Page {catalog.page} of {catalog.totalPages}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-28 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <span className="text-xs font-semibold text-slate-500 tracking-wide">
                Querying live catalog inventory...
              </span>
            </div>
          ) : catalog.products.length === 0 ? (
            <NoProductAvailable
              selectedTab={selectedCategory || searchQuery || (selectedBrand ? `Brand: ${selectedBrand}` : "active filters")}
            />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${searchQuery}-${selectedCategory}-${selectedBrand}-${minPrice}-${maxPrice}-${selectedRating}-${inStockOnly}-${bankDiscount}-${noCostEmi}-${selectedSort}-${currentPage}`}
                initial={{ opacity: 0.2, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
              >
                {catalog.products.map((product, index) => (
                  <motion.div
                    key={product.id || product._id || index}
                    layout
                    initial={{ opacity: 0.2 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                  >
                    <ProductCard {...product} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Pagination Controls */}
          {catalog.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6 mt-8">
              <button
                onClick={() => handlePageChange(catalog.page - 1)}
                disabled={catalog.page <= 1 || loading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              {/* Page Number Pills */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, catalog.totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (catalog.totalPages > 5) {
                    if (catalog.page > 3) {
                      pageNum = catalog.page - 2 + i;
                    }
                    if (pageNum > catalog.totalPages) {
                      pageNum = catalog.totalPages - (4 - i);
                    }
                  }

                  const isCurrent = pageNum === catalog.page;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loading}
                      className={`h-8 w-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(catalog.page + 1)}
                disabled={catalog.page >= catalog.totalPages || loading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
