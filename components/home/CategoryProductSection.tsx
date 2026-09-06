'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  AirVent,
  Smartphone,
  Laptop,
  Home,
  UtensilsCrossed,
  Tv,
  Headphones,
  Store,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { VIJAY_SALES_CATEGORIES } from '@/constants/navigation';
import { getCategoryGridProducts } from '@/actions/categoryGrid';
import { ProductCard } from '@/components/product/ProductCard';
import { NoProductAvailable } from '@/components/product/NoProductAvailable';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  AirVent,
  Smartphone,
  Laptop,
  Home,
  UtensilsCrossed,
  Tv,
  Headphones,
  Store,
};

export interface CategoryProductSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialProducts?: any[];
}

export function CategoryProductSection({ initialProducts = [] }: CategoryProductSectionProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleTabChange = useCallback(async (slug: string) => {
    setActiveTab(slug);
    setLoading(true);
    try {
      const data = await getCategoryGridProducts(slug);
      setProducts(data);
    } catch (err) {
      console.error('[CATEGORY TAB CHANGE ERROR]:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const seeAllHref = activeTab === 'all' ? '/shop' : `/shop?category=${encodeURIComponent(activeTab)}`;

  return (
    <section className="space-y-6">
      {/* Category Navigation Bar & See All CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        {/* Left Horizontal Category Pills Container with Chevrons */}
        <div className="relative flex-1 min-w-0 flex items-center">
          {/* Scroll Left Button */}
          <button
            type="button"
            onClick={() => scroll('left')}
            className="hidden md:flex shrink-0 items-center justify-center h-8 w-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 mr-2 cursor-pointer z-10 transition-colors"
            aria-label="Scroll categories left"
          >
            <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </button>

          {/* Scrollable Pills Container */}
          <div
            ref={scrollRef}
            className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-1 scroll-smooth w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {VIJAY_SALES_CATEGORIES.map((cat) => {
              const isActive = activeTab.toLowerCase() === cat.value.toLowerCase();
              const IconComponent = ICON_MAP[cat.iconName] || Sparkles;

              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => handleTabChange(cat.value)}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border',
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                >
                  <IconComponent className={cn('h-3.5 w-3.5', isActive ? 'text-white' : 'text-emerald-600')} />
                  <span>{cat.title}</span>
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          <button
            type="button"
            onClick={() => scroll('right')}
            className="hidden md:flex shrink-0 items-center justify-center h-8 w-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 ml-2 cursor-pointer z-10 transition-colors"
            aria-label="Scroll categories right"
          >
            <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        {/* Top-Right "See All" CTA */}
        <Link
          href={seeAllHref}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-900 transition-all shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <span>See All</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 3x5 Product Grid (15 Items Max) with Skeleton Shimmer */}
      <div className="min-h-[420px]">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 my-4">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-slate-100 dark:bg-slate-800/80 rounded-2xl h-72 border border-slate-200/60 dark:border-slate-700/60 p-3 flex flex-col justify-between"
              >
                <div className="bg-slate-200 dark:bg-slate-700 rounded-xl h-36 w-full" />
                <div className="space-y-2 mt-3">
                  <div className="bg-slate-200 dark:bg-slate-700 rounded-md h-3.5 w-3/4" />
                  <div className="bg-slate-200 dark:bg-slate-700 rounded-md h-3.5 w-1/2" />
                  <div className="bg-slate-200 dark:bg-slate-700 rounded-md h-4 w-1/3 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <NoProductAvailable selectedTab={activeTab} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0.2, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 my-4"
            >
              {products.slice(0, 15).map((product, index) => (
                <motion.div
                  key={product._id || product.id || index}
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
      </div>
    </section>
  );
}
