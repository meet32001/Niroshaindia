import { Container } from "@/components/layout/Container";
import { Title, SubText } from "@/components/ui/text";
import { CategoryProducts } from "@/components/category/CategoryProducts";
import { getCategories } from "@/sanity/lib/queries";

export interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const categories = await getCategories();

  const formattedTitle = slug.replace(/-/g, " ");

  return (
    <div className="py-8">
      <Container className="space-y-4">
        <div>
          <Title className="capitalize">Category: {formattedTitle}</Title>
          <SubText>
            Browse available electronics, gadgets, and home appliances matching the selected category.
          </SubText>
        </div>

        <CategoryProducts categories={categories} initialSlug={slug} />
      </Container>
    </div>
  );
}
