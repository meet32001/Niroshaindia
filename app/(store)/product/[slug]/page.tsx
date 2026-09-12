import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ProductDetailView } from "@/components/product/ProductDetailView";
import { getProductBySlug } from "@/lib/db/products";

export interface SingleProductPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: SingleProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const sParams = await searchParams;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | Nirosha",
      description: "The requested electronics product could not be found.",
    };
  }

  const querySku =
    typeof sParams.sku === "string"
      ? sParams.sku
      : typeof sParams.variant === "string"
      ? sParams.variant
      : undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variants = (product.variants || product.product_variants || []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeVariant = querySku
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? variants.find((v: any) => v.sku?.toLowerCase() === querySku.toLowerCase()) || variants[0]
    : variants[0] || product;

  const title = activeVariant?.name
    ? `${activeVariant.name} | Nirosha India`
    : `${product.name} | Nirosha India`;

  const description =
    product.description ||
    `Shop ${product.name} at best prices in India with fast shipping and official brand warranty.`;

  const imageUrl =
    activeVariant?.images?.[0] ||
    product.images?.[0] ||
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function SingleProductPage({
  params,
  searchParams,
}: SingleProductPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams.slug;

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const initialSku =
    typeof resolvedSearchParams.sku === "string"
      ? resolvedSearchParams.sku
      : typeof resolvedSearchParams.variant === "string"
      ? resolvedSearchParams.variant
      : undefined;

  return (
    <div className="py-6 md:py-10">
      <Container>
        <ProductDetailView product={product} initialSku={initialSku} />
      </Container>
    </div>
  );
}
