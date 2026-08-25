import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { HomeBanner } from "@/components/layout/HomeBanner";
import { ProductCard } from "@/components/product/ProductCard";
import { Title, SubText } from "@/components/ui/text";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/sanity/lib/mockData";
import { Headphones, Tv, Refrigerator, Cpu, ArrowRight } from "lucide-react";

export default function StoreHomePage() {
  const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    Headphones: <Headphones className="h-6 w-6 text-shop-orange" />,
    Tv: <Tv className="h-6 w-6 text-shop-orange" />,
    Refrigerator: <Refrigerator className="h-6 w-6 text-shop-orange" />,
    Cpu: <Cpu className="h-6 w-6 text-shop-orange" />,
  };

  return (
    <div className="py-8 space-y-14">
      <Container className="space-y-12">
        {/* Hero Banner */}
        <HomeBanner />

        {/* Categories Bar */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Title>Browse Categories</Title>
              <SubText>Explore electronics organized by specialized categories.</SubText>
            </div>
            <Link
              href="/shop"
              className="text-xs font-semibold text-shop-orange hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {MOCK_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-shop-orange hover:shadow-md transition-all duration-300 flex flex-col items-center text-center space-y-2"
              >
                <div className="p-3 rounded-xl bg-shop-light-pink dark:bg-slate-800 group-hover:scale-110 transition-transform duration-300">
                  {CATEGORY_ICONS[cat.icon] || <Cpu className="h-6 w-6 text-shop-orange" />}
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-shop-orange transition-colors">
                  {cat.title}
                </h4>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Title>Featured Electronics</Title>
              <SubText>Top-rated gadgets and high-performance smart appliances.</SubText>
            </div>
            <Link
              href="/shop"
              className="text-xs font-semibold text-shop-orange hover:underline flex items-center gap-1"
            >
              <span>Explore Shop</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOCK_PRODUCTS.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}
