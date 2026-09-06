import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { BRANDS_LIST } from "@/lib/data/brandsData";

export const metadata = {
  title: "Brands | Discover Top Brands - Nirosha",
  description: "Browse official brand stores and products from Apple, Samsung, Sony, LG, Whirlpool, Dell, HP and more.",
};

export default function BrandsDirectoryPage() {
  return (
    <div className="py-8 min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <Container className="space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold">Brands</span>
        </nav>

        {/* Page Title Header */}
        <div className="mb-8">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Brands</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Discover top brand with Nirosha
          </h1>
        </div>

        {/* 7-Column Grid of Circular Brand Badges */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-6 sm:gap-8 py-6">
          {BRANDS_LIST.map((brand) => (
            <Link
              key={brand.slug}
              href={`/shop?brand=${encodeURIComponent(brand.slug)}`}
              className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-lg transition-all duration-300 flex items-center justify-center p-4 mx-auto group cursor-pointer"
            >
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 flex items-center justify-center">
                <Image
                  src={brand.logoUrl}
                  alt={brand.name}
                  fill
                  sizes="(max-width: 640px) 56px, (max-width: 1024px) 64px, 80px"
                  className="object-contain transition-transform group-hover:scale-110"
                />
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
