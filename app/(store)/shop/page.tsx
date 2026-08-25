import { Container } from "@/components/layout/Container";
import { ProductCard } from "@/components/product/ProductCard";
import { Title, SubText } from "@/components/ui/text";
import { MOCK_PRODUCTS } from "@/sanity/lib/mockData";

export default function ShopPage() {
  return (
    <div className="py-8">
      <Container className="space-y-8">
        <div>
          <Title>Shop All Electronics</Title>
          <SubText>
            Browse our full catalog of high-performance gadgets, smart appliances, audio systems, and accessories.
          </SubText>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_PRODUCTS.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </Container>
    </div>
  );
}
