import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { HeroBanner } from "@/components/home/HeroBanner";
import { ProductCard } from "@/components/product/ProductCard";
import { Product } from "@/types";

const FEATURED_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    title: "Nirosha Sonic X Pro Wireless ANC Headphones",
    slug: "nirosha-sonic-x-pro",
    category: "Audio",
    price: 4999,
    discountPrice: 8999,
    rating: 4.8,
    reviewsCount: 342,
    stockStatus: "in_stock",
    brand: "Nirosha",
    images: [],
    description: "Flagship wireless noise-cancelling headphones.",
    tag: "Best Seller",
  },
  {
    id: "prod-2",
    title: "UltraCharge 100W GaN Fast Charger",
    slug: "ultracharge-100w-gan",
    category: "Accessories",
    price: 2499,
    discountPrice: 3999,
    rating: 4.9,
    reviewsCount: 189,
    stockStatus: "in_stock",
    brand: "UltraCharge",
    images: [],
    description: "Compact multi-port fast charging adapter.",
    tag: "Hot Deal",
  },
  {
    id: "prod-3",
    title: "PulseFit Pro AMOLED Smartwatch",
    slug: "pulsefit-pro-smartwatch",
    category: "Wearables",
    price: 3799,
    discountPrice: 5999,
    rating: 4.6,
    reviewsCount: 94,
    stockStatus: "in_stock",
    brand: "PulseFit",
    images: [],
    description: "Always-on AMOLED smartwatch with health sensors.",
    tag: "New",
  },
  {
    id: "prod-4",
    title: "AeroPad Wireless Mechanical Keyboard",
    slug: "aeropad-wireless-keyboard",
    category: "Peripherals",
    price: 5499,
    discountPrice: 7499,
    rating: 4.7,
    reviewsCount: 156,
    stockStatus: "in_stock",
    brand: "AeroPad",
    images: [],
    description: "RGB mechanical keyboard with hot-swappable switches.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <Container className="space-y-12">
          <HeroBanner />

          {/* Featured Products Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Featured Electronics
                </h2>
                <p className="text-sm text-slate-500">
                  Top rated gadgets selected for performance and quality.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURED_PRODUCTS.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </section>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
