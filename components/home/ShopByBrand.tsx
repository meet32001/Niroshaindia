import Link from "next/link";
import { Truck, RotateCcw, Headphones, ShieldCheck } from "lucide-react";
import { Title, SubText } from "@/components/ui/text";
import { getAllBrands } from "@/sanity/lib/queries";

export async function ShopByBrand() {
  const brands = await getAllBrands();

  const GUARANTEE_FEATURES = [
    {
      icon: Truck,
      title: "Free Delivery",
      subtitle: "Free delivery on orders above ₹999",
    },
    {
      icon: RotateCcw,
      title: "Easy Returns",
      subtitle: "7-day hassle-free replacement",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      subtitle: "Dedicated support hotline",
    },
    {
      icon: ShieldCheck,
      title: "Secure Payment",
      subtitle: "100% verified SSL checkout",
    },
  ];

  return (
    <section className="space-y-8 pt-4">
      {/* Brands Header & Grid */}
      <div className="space-y-4">
        <div>
          <Title>Shop by Brand</Title>
          <SubText>Explore flagship electronics from world-class manufacturing partners.</SubText>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 mt-6">
          {brands.map((brand, index) => {
            const rawSlug = typeof brand.slug === "string" ? brand.slug : brand.slug?.current;
            const slug = rawSlug || "brand";

            return (
              <Link
                key={brand._id || brand.id || index}
                href={`/shop?brand=${slug}`}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex flex-col items-center justify-center h-20 hover:shadow-md hover:border-shop-orange transition-all duration-300 group text-center"
              >
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-shop-orange transition-colors">
                  {brand.title}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Official Partner</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Trust & Guarantee Feature Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10 pt-8 border-t border-slate-200 dark:border-slate-800">
        {GUARANTEE_FEATURES.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center gap-4 hover:border-shop-orange/40 transition-colors"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-shop-orange/10 text-shop-orange">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-shop-dark dark:text-slate-100">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
