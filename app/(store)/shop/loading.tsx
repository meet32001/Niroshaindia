import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShopLoading() {
  return (
    <div className="py-6">
      <Container>
        <div className="space-y-6">
          {/* Header & Controls Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 rounded-lg" />
              <Skeleton className="h-4 w-72 rounded" />
            </div>
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-9 w-24 rounded-xl" />
              <Skeleton className="h-9 w-36 rounded-xl" />
            </div>
          </div>

          {/* Main Grid: Sidebar + Product Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Left Filters Sidebar Skeleton */}
            <aside className="hidden lg:block lg:col-span-1 space-y-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              {/* Categories */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-28 rounded" />
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-1">
                      <Skeleton className="h-3.5 w-24 rounded" />
                      <Skeleton className="h-3.5 w-6 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                <Skeleton className="h-4 w-20 rounded" />
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-1">
                      <Skeleton className="h-3.5 w-28 rounded" />
                      <Skeleton className="h-3.5 w-5 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            </aside>

            {/* Right Product Grid Skeleton */}
            <main className="lg:col-span-3 min-h-[450px]">
              <div className="flex items-center justify-between text-xs mb-4">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-4 shadow-xs"
                  >
                    {/* Product Image Skeleton */}
                    <Skeleton className="h-48 w-full rounded-xl" />
                    {/* Brand & Category */}
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-16 rounded" />
                      <Skeleton className="h-3 w-20 rounded" />
                    </div>
                    {/* Title */}
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-full rounded" />
                      <Skeleton className="h-4 w-3/4 rounded" />
                    </div>
                    {/* Price and Cart */}
                    <div className="pt-2 flex items-center justify-between">
                      <div className="space-y-1">
                        <Skeleton className="h-5 w-20 rounded" />
                        <Skeleton className="h-3 w-14 rounded" />
                      </div>
                      <Skeleton className="h-9 w-24 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            </main>
          </div>
        </div>
      </Container>
    </div>
  );
}
