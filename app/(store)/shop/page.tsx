import { Container } from "@/components/layout/Container";
import { Shop } from "@/components/shop/Shop";
import { getCategories, getAllBrands } from "@/sanity/lib/queries";

export default async function ShopPage() {
  const categories = await getCategories();
  const brands = await getAllBrands();

  return (
    <div className="py-6">
      <Container>
        <Shop categories={categories} brands={brands} />
      </Container>
    </div>
  );
}
