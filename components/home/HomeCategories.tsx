import Link from "next/link";
import Image from "next/image";
import { getCategories } from "@/lib/db/products";

export async function HomeCategories() {
  const categories = await getCategories(6);

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 my-10 shadow-xs">
      {/* Header with Divider */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Popular Categories
        </h2>
      </div>

      {/* 3x2 Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {categories.map((category, index) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rawSlug = typeof category.slug === "string" ? category.slug : (category.slug as any)?.current;
          const slug = rawSlug || "gadgets";
          const count = category.productCount ?? 0;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const catName = category.name || category.title || (category as any).name || "Category";
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rawImg = (category as any).image_url || category.image;

          let imageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
          if (typeof rawImg === "string" && rawImg.startsWith("http")) {
            imageUrl = rawImg;
          }

          return (
            <Link
              key={category._id || category.id || index}
              href={`/category/${slug}`}
              className="bg-slate-50/90 dark:bg-slate-800/60 hover:bg-slate-100/90 dark:hover:bg-slate-800 rounded-xl p-4 flex items-center gap-4 border border-slate-100 dark:border-slate-700/80 hover:border-slate-200 dark:hover:border-slate-600 transition-all duration-200 group"
            >
              {/* Left Square Thumbnail Box */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-slate-900 rounded-lg p-2 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={catName}
                    width={80}
                    height={80}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded" />
                )}
              </div>

              {/* Right Category Details */}
              <div className="flex flex-col">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 capitalize group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {catName}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">({count})</span> items Available
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
