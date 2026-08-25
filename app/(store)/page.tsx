import { Container } from "@/components/layout/Container";
import { HomeBanner } from "@/components/layout/HomeBanner";
import { HomeTabContainer } from "@/components/product/HomeTabContainer";

export default function StoreHomePage() {
  return (
    <div className="py-8 space-y-12">
      <Container className="space-y-10">
        {/* Top Hero Light Banner */}
        <HomeBanner />

        {/* Dynamic Category Pill Tabs & Product Grid Engine */}
        <HomeTabContainer />
      </Container>
    </div>
  );
}
