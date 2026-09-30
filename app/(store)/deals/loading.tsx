import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/skeleton";

export default function DealsLoading() {
  return (
    <div className="py-8 space-y-8">
      <Container>
        <div className="space-y-8">
          {/* Header Banner Skeleton */}
          <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto">
            <Skeleton className="h-6 w-36 rounded-full" />
            <Skeleton className="h-10 w-80 sm:w-96 rounded-xl" />
            <Skeleton className="h-4 w-full max-w-md rounded" />
            {/* Countdown placeholder */}
            <div className="flex items-center gap-3 pt-2">
              <Skeleton className="h-12 w-16 rounded-xl" />
              <Skeleton className="h-12 w-16 rounded-xl" />
              <Skeleton className="h-12 w-16 rounded-xl" />
              <Skeleton className="h-12 w-16 rounded-xl" />
            </div>
          </div>

          {/* Bumper Offer Hero Card Skeleton */}
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent rounded-3xl border border-amber-500/30 p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Product Image Skeleton */}
              <Skeleton className="h-64 sm:h-80 w-full rounded-2xl" />

              {/* Product Details Skeleton */}
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-32 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full rounded-lg" />
                  <Skeleton className="h-8 w-2/3 rounded-lg" />
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <Skeleton className="h-10 w-28 rounded-lg" />
                  <Skeleton className="h-6 w-24 rounded" />
                  <Skeleton className="h-6 w-32 rounded" />
                </div>
                <div className="pt-2 flex gap-3">
                  <Skeleton className="h-12 w-44 rounded-xl" />
                  <Skeleton className="h-12 w-32 rounded-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Curated Deals Grid Skeleton */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <Skeleton className="h-6 w-48 rounded" />
                <Skeleton className="h-4 w-64 rounded" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-4 shadow-xs"
                >
                  <Skeleton className="h-44 w-full rounded-xl" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-16 rounded" />
                    <Skeleton className="h-3 w-12 rounded" />
                  </div>
                  <Skeleton className="h-4 w-full rounded" />
                  <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-5 w-20 rounded" />
                    <Skeleton className="h-8 w-20 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
