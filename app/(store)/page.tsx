import { Container } from "@/components/layout/Container";
import { HomeBanner } from "@/components/layout/HomeBanner";
import { HomeTabContainer } from "@/components/product/HomeTabContainer";
import { HomeCategories } from "@/components/home/HomeCategories";
import { ShopByBrand } from "@/components/home/ShopByBrand";
import { LatestBlog } from "@/components/home/LatestBlog";

export default function StoreHomePage() {
  return (
    <div className="py-8 space-y-16">
      <Container className="space-y-14">
        {/* 1. Top Hero Light Banner */}
        <HomeBanner />

        {/* 2. Dynamic Category Pill Tabs & Product Grid Engine */}
        <HomeTabContainer />

        {/* 3. Popular Categories Grid */}
        <HomeCategories />

        {/* 4. Shop by Brand & Trust Guarantee Strip */}
        <ShopByBrand />

        {/* 5. Latest Tech Articles & News */}
        <LatestBlog />
      </Container>
    </div>
  );
}
