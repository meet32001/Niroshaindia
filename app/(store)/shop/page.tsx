import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Shop } from "@/components/shop/Shop";
import { getCategories, getAllBrands } from "@/sanity/lib/queries";

export default async function ShopPage() {
  const categories = await getCategories();
  const brands = await getAllBrands();

  return (
    <div className="py-6">
      <Container>
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <span className="text-xs font-semibold text-slate-500">Loading shop storefront...</span>
            </div>
          }
        >
          <Shop categories={categories} brands={brands} />
        </Suspense>
      </Container>
    </div>
  );
}
