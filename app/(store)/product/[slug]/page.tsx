import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { ProductDetailView } from "@/components/product/ProductDetailView";
import { getProductBySlug } from "@/lib/db/products";

export interface SingleProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SingleProductPage({ params }: SingleProductPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="py-8 md:py-12">
      <Container>
        <ProductDetailView product={product} />
      </Container>
    </div>
  );
}
