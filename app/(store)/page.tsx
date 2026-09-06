import { Container } from "@/components/layout/Container";
import { HomeBanner } from "@/components/layout/HomeBanner";
import { HomeTabContainer } from "@/components/product/HomeTabContainer";
import { HomeCategories } from "@/components/home/HomeCategories";
import { ShopByBrand } from "@/components/home/ShopByBrand";
import { getCategoryGridProducts } from "@/actions/categoryGrid";

export default async function StoreHomePage() {
  const initialProducts = await getCategoryGridProducts("all");

  return (
    <div className="py-8 space-y-16">
      <Container className="space-y-14">
        {/* 1. Top Hero Light Banner */}
        <HomeBanner />

        {/* 2. Vijay Sales-Style Horizontal Category Bar & 3x5 Product Grid */}
        <HomeTabContainer initialProducts={initialProducts} />

        {/* 3. Popular Categories Grid */}
        <HomeCategories />

        {/* 4. Shop by Brand & Trust Guarantee Strip */}
        <ShopByBrand />
      </Container>
    </div>
  );
}
