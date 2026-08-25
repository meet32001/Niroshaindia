import { Container } from "@/components/layout/Container";
import { ProductCard } from "@/components/product/ProductCard";
import { Title, SubText } from "@/components/ui/text";
import { MOCK_PRODUCTS } from "@/sanity/lib/mockData";

export interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const categoryTitle =
    slug.charAt(0).toUpperCase() + slug.slice(1).replace("-", " ");

  const filteredProducts = MOCK_PRODUCTS.filter(
    (p) => p.category.toLowerCase().includes(slug.toLowerCase()) || true
  );

  return (
    <div className="py-8">
      <Container className="space-y-8">
        <div>
          <Title>{categoryTitle} Collection</Title>
          <SubText>
            Discover top-tier products in the {categoryTitle} category with official warranty.
          </SubText>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </Container>
    </div>
  );
}
