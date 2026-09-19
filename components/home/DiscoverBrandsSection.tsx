import Link from "next/link";
import Image from "next/image";
import { BRANDS_LIST } from "@/lib/data/brandsData";

export function DiscoverBrandsSection() {
  const leadingBrands = BRANDS_LIST.filter((brand) => brand.isLeading);

  return (
    <section className="py-12 bg-white dark:bg-slate-950 text-center flex flex-col items-center rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-2xs">
      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
        Discover Leading Brands
      </h2>
      <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl px-4">
        Explore a curated selection of leading brands, where innovation meets quality, only at Nirosha.
      </p>

      {/* Circle Brand List */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap my-8 max-w-6xl px-4">
        {leadingBrands.map((brand) => (
          <Link
            key={brand.slug}
            href={`/shop?brand=${encodeURIComponent(brand.slug)}`}
            className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-[#f6f7f9] dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center p-4 hover:shadow-md hover:scale-105 transition-all duration-300 group cursor-pointer"
          >
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center">
              <Image
                src={brand.logoUrl}
                alt={brand.name}
                fill
                sizes="(max-width: 640px) 56px, (max-width: 768px) 64px, 80px"
                className="object-contain filter group-hover:brightness-105 transition-all"
              />
            </div>
          </Link>
        ))}
      </div>

      {/* CTA Button */}
      <Link
        href="/shop"
        className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-xs"
      >
        Shop Top Brands
      </Link>
    </section>
  );
}
