import Link from "next/link";
import Image from "next/image";
import { Truck, RefreshCw, Headphones, ShieldCheck } from "lucide-react";
import { getAllBrands } from "@/lib/db/products";

export async function ShopByBrand() {
  const brands = await getAllBrands();

  // Explicitly allow only the 4 brands with valid assets (Apple, Sony, Dell, HP)
  const allowedBrandNames = ["apple", "sony", "dell", "hp"];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const featuredBrands = brands.filter((brand: any) => {
    const name = (brand.name || brand.title || "").toLowerCase().trim();
    const rawSlug = typeof brand.slug === "string" ? brand.slug : brand.slug?.current;
    const slug = (rawSlug || "").toLowerCase().trim();
    const hasImage = Boolean(brand.logo_url || brand.image || brand.logo);

    return (allowedBrandNames.includes(name) || allowedBrandNames.includes(slug)) && hasImage;
  });

  return (
    <section className="bg-slate-50/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 lg:p-10 my-10 shadow-xs">
      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Shop By Brands
        </h2>
        <Link
          href="/shop"
          className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
        >
          View all
        </Link>
      </div>

      {/* Exactly 4 Brand Logo Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6 sm:my-8">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {featuredBrands.map((brand: any, index: number) => {
          const rawSlug = typeof brand.slug === "string" ? brand.slug : brand.slug?.current;
          const slug = rawSlug || "brand";

          const imageUrl = brand.logo_url || brand.image || brand.logo || "";

          if (!imageUrl) return null;

          return (
            <Link
              key={brand._id || brand.id || index}
              href={`/shop?brand=${slug}`}
              className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-2xs border border-slate-200/80 dark:border-slate-800 flex items-center justify-center h-20 sm:h-24 hover:shadow-md hover:scale-105 transition-all duration-200 group cursor-pointer"
            >
              <Image
                src={imageUrl}
                alt={brand.name || brand.title || "Brand Logo"}
                width={140}
                height={60}
                className="max-h-10 sm:max-h-12 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
          );
        })}
      </div>

      {/* Bottom Features Divider & Row */}
      <div className="border-t border-slate-200/80 dark:border-slate-800 pt-6 sm:pt-8 mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8 text-slate-700 dark:text-slate-300 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Free Delivery</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Free shipping over ₹999</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RefreshCw className="w-8 h-8 text-slate-700 dark:text-slate-300 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Free Return</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">7-day easy return policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Headphones className="w-8 h-8 text-slate-700 dark:text-slate-300 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Customer Support</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Friendly 24/7 customer support</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-slate-700 dark:text-slate-300 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Money Back Guarantee</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Quality checked by our team</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
