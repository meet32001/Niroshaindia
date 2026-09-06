'use client';

import Link from 'next/link';
import Image from 'next/image';

export interface VisualCategory {
  title: string;
  slug: string;
  itemCountLabel: string;
  imageUrl: string;
  badge?: string;
}

export const POPULAR_CATEGORIES: VisualCategory[] = [
  {
    title: 'Smartphones & Tablets',
    slug: 'mobiles-tablets-accessories',
    itemCountLabel: 'Flagships, 5G & Foldables',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
    badge: 'Popular',
  },
  {
    title: 'Air Conditioners',
    slug: 'ac',
    itemCountLabel: 'Inverter Split & Window ACs',
    imageUrl: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop&q=80',
    badge: 'Seasonal',
  },
  {
    title: 'Televisions & Audio',
    slug: 'tv',
    itemCountLabel: 'OLED, QLED & 4K Smart TVs',
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Laptops & Computers',
    slug: 'laptops-accessories',
    itemCountLabel: 'Gaming, Thin & Light, MacBooks',
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Home & Kitchen Appliances',
    slug: 'kitchen-appliances',
    itemCountLabel: 'Air Fryers, Water Purifiers & More',
    imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Headphones & Speakers',
    slug: 'headphones-speakers',
    itemCountLabel: 'Noise Cancelling TWS & Soundbars',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
  },
];

export function HomeCategories() {
  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Explore Popular Categories
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Browse our top electronic departments curated from official brand partners
          </p>
        </div>
      </div>

      {/* 6-Column Visual Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {POPULAR_CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/shop?category=${encodeURIComponent(cat.slug)}`}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all duration-300 group overflow-hidden flex flex-col justify-between"
          >
            {/* Image Container */}
            <div className="relative w-full aspect-square bg-slate-50 dark:bg-slate-800/40 overflow-hidden rounded-t-2xl p-4 flex items-center justify-center">
              <Image
                src={cat.imageUrl}
                alt={cat.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
              />

              {/* Optional Badge */}
              {cat.badge && (
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-2xs">
                    {cat.badge}
                  </span>
                </div>
              )}
            </div>

            {/* Text Details */}
            <div className="p-3 text-center flex flex-col items-center justify-center flex-1">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                {cat.title}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 font-medium">
                {cat.itemCountLabel}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
