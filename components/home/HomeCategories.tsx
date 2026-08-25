import Link from "next/link";
import Image from "next/image";
import { Title, SubText } from "@/components/ui/text";
import { getCategories } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";

export async function HomeCategories() {
  const categories = await getCategories(6);

  return (
    <section className="space-y-4 pt-4">
      <div>
        <Title>Popular Categories</Title>
        <SubText>Explore top electronics and home gadgets with guaranteed warranty.</SubText>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {categories.map((category, index) => {
          const rawSlug = typeof category.slug === "string" ? category.slug : category.slug?.current;
          const slug = rawSlug || "gadgets";
          const count = category.productCount || 10;

          let imageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
          if (typeof category.image === "string") {
            imageUrl = category.image;
          } else if (category.image?.asset) {
            try {
              imageUrl = urlFor(category.image).url();
            } catch {
              imageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
            }
          }

          return (
            <Link
              key={category._id || category.id || index}
              href={`/category/${slug}`}
              className="bg-[#F8FAFC] dark:bg-slate-900 p-4 rounded-2xl flex items-center gap-4 hover:shadow-md border border-green-100 dark:border-slate-800 transition-all duration-300 group"
            >
              <div className="w-20 h-20 overflow-hidden rounded-xl bg-white dark:bg-slate-800 p-1.5 border border-slate-200/80 dark:border-slate-700 shrink-0 relative flex items-center justify-center">
                <Image
                  src={imageUrl}
                  alt={category.title}
                  fill
                  sizes="80px"
                  className="object-contain p-1 group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">
                  {category.title}
                </h3>
                <p className="text-xs font-bold text-emerald-600">
                  {count} {count === 1 ? "Item" : "Items"} Available
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
