'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, X, Loader2, TrendingUp, Sparkles, ChevronRight, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { liveSearch, SearchResponse } from '@/actions/search';

const TRENDING_SEARCHES = [
  { name: 'Headphones', query: 'headphones' },
  { name: 'Laptops', query: 'laptop' },
  { name: 'Air Conditioners', query: 'air' },
  { name: 'Smartphones', query: 'mobile' },
];

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search trigger
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await liveSearch(trimmed);
        setResults(data);
      } catch (err) {
        console.error('[SEARCH BAR ERROR]:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside and Escape key handlers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setIsMobileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNavigateToShop = useCallback(
    (searchQuery?: string) => {
      const q = searchQuery || query;
      if (!q.trim()) return;
      setIsOpen(false);
      setIsMobileOpen(false);
      router.push(`/shop?search=${encodeURIComponent(q.trim())}`);
    },
    [query, router]
  );

  const handleProductClick = useCallback(
    (slug: string) => {
      setIsOpen(false);
      setIsMobileOpen(false);
      router.push(`/product/${slug}`);
    },
    [router]
  );

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNavigateToShop();
    }
  };

  const renderDropdownContent = () => {
    const trimmed = query.trim();

    // Zero-State: Show trending searches when query is short
    if (trimmed.length < 2) {
      return (
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
            <span>Popular & Trending Searches</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TRENDING_SEARCHES.map((item) => (
              <button
                key={item.query}
                type="button"
                onClick={() => {
                  setQuery(item.query);
                  handleNavigateToShop(item.query);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-400 rounded-full border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <Tag className="h-3 w-3 text-slate-400" />
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <span className="text-xs font-medium">Searching catalog...</span>
        </div>
      );
    }

    if (!results) return null;

    return (
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {/* Suggested Categories */}
        {results.suggestedCategories && results.suggestedCategories.length > 0 && (
          <div className="p-3 bg-slate-50/80 dark:bg-slate-900/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              In Categories
            </span>
            <div className="flex flex-wrap gap-1.5">
              {results.suggestedCategories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsMobileOpen(false);
                    router.push(`/shop?category=${encodeURIComponent(cat.slug)}`);
                  }}
                  className="px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-md border border-emerald-200 dark:border-emerald-900 transition-colors cursor-pointer"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fallback Notice */}
        {results.isFallback && (
          <div className="px-3.5 py-2 bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200/60 dark:border-amber-900/60 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300 font-medium">
            <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
            <span>No exact match for &quot;{trimmed}&quot;. Showing popular items:</span>
          </div>
        )}

        {/* Product Previews List */}
        <div className="p-2 space-y-1">
          {results.products.map((item) => (
            <div
              key={item.id}
              onClick={() => handleProductClick(item.slug)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer group"
            >
              <div className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {item.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                  <span className="truncate">{item.brandName}</span>
                  <span>•</span>
                  <span className="truncate">{item.categoryName}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  ₹{(item.priceCents / 100).toLocaleString('en-IN')}
                </p>
                {item.compareAtPriceCents && item.compareAtPriceCents > item.priceCents && (
                  <p className="text-[10px] text-slate-400 line-through">
                    ₹{(item.compareAtPriceCents / 100).toLocaleString('en-IN')}
                  </p>
                )}
                {item.inStock ? (
                  <span className="inline-block mt-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                    In Stock
                  </span>
                ) : (
                  <span className="inline-block mt-0.5 text-[9px] font-semibold text-rose-500">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer View All CTA */}
        <button
          type="button"
          onClick={() => handleNavigateToShop()}
          className="w-full p-3 text-xs font-bold text-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>
            {results.isFallback
              ? `Browse catalog for "${trimmed}"`
              : `View all ${results.totalCount} results for "${trimmed}"`}
          </span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-sm">
      {/* Desktop Search Input */}
      <div className="hidden md:flex items-center relative w-full">
        <Input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDownInput}
          placeholder="Search headphones, laptops, mobiles..."
          className="w-full pl-9 pr-8 h-9 text-xs rounded-full bg-slate-100 dark:bg-slate-800 border-none focus-visible:ring-1 focus-visible:ring-emerald-600 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
        />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults(null);
            }}
            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Desktop Live Search Popover */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden min-w-[340px] max-h-[460px] overflow-y-auto">
            {renderDropdownContent()}
          </div>
        )}
      </div>

      {/* Mobile Search Trigger Icon */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-slate-700 dark:text-slate-200 cursor-pointer"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open search modal"
      >
        <Search className="h-5 w-5" />
      </Button>

      {/* Mobile Search Modal Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden flex flex-col justify-start p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <Input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDownInput}
                placeholder="Search products..."
                className="w-full h-9 text-xs border-none focus-visible:ring-0"
              />
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">{renderDropdownContent()}</div>
          </div>
        </div>
      )}
    </div>
  );
}
