import { Container } from "@/components/layout/Container";
import { ProductCard } from "@/components/product/ProductCard";
import { Title, SubText } from "@/components/ui/text";
import { getDealProducts } from "@/lib/db/products";
import { Flame } from "lucide-react";

export default async function DealPage() {
  const products = await getDealProducts();

  return (
    <div className="py-8 space-y-8">
      <Container className="space-y-8">
        {/* Deal Header Banner */}
        <div className="bg-[#fbf6ee]/80 dark:bg-slate-900 rounded-2xl p-8 border border-amber-100/60 dark:border-slate-800 space-y-2 relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-900">
            <Flame className="h-4 w-4 fill-rose-600" />
            <span>Exclusive Flash Offers</span>
          </div>

          <Title className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Hot Deals of the Week
          </Title>

          <SubText className="max-w-2xl text-slate-700 dark:text-slate-300">
            Unbeatable prices on flagship noise-cancelling headphones, high-refresh rate laptops, smart appliances, and 4K displays. Limited stock available!
          </SubText>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {products.map((product, index) => (
            <ProductCard key={product._id || product.id || index} {...product} />
          ))}
        </div>
      </Container>
    </div>
  );
}
