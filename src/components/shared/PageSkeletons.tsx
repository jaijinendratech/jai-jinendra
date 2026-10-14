import { cn } from "@/lib/cn";

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-outline-variant/25", className)}
      aria-hidden
    />
  );
}

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-lowest">
      <Bone className="aspect-square w-full rounded-none" />
      <div className="space-y-2 p-3">
        <Bone className="h-4 w-3/4" />
        <Bone className="h-3 w-1/2" />
        <Bone className="mt-3 h-8 w-full rounded-lg" />
      </div>
    </div>
  );
}

/** Mirrors CataloguePageView: breadcrumbs, title, pills, product grid. */
export function CatalogueSkeleton() {
  return (
    <main className="container-jj py-6 md:py-8" role="status" aria-label="Loading products">
      <Bone className="h-3 w-48" />
      <Bone className="mt-5 h-8 w-72 max-w-full md:h-10" />
      <Bone className="mt-3 h-4 w-96 max-w-full" />
      <div className="mt-6 flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <Bone key={i} className="h-9 w-24 shrink-0 rounded-full" />
        ))}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}

/** Mirrors ProductDetailView: gallery left, purchase panel right. */
export function ProductDetailSkeleton() {
  return (
    <main className="container-jj pb-24 pt-4 md:py-10 md:pb-10" role="status" aria-label="Loading product">
      <Bone className="hidden h-3 w-64 md:block" />
      <div className="mt-4 grid gap-5 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6">
          <Bone className="aspect-square w-full rounded-2xl" />
          <div className="mt-3 flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Bone key={i} className="h-16 w-16 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-4 lg:col-span-6">
          <Bone className="h-3 w-24" />
          <Bone className="h-9 w-4/5" />
          <Bone className="h-4 w-1/3" />
          <Bone className="h-8 w-32" />
          <div className="flex gap-2 pt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Bone key={i} className="h-10 w-24 rounded-lg" />
            ))}
          </div>
          <Bone className="h-12 w-full rounded-lg" />
          <div className="space-y-2 pt-4">
            <Bone className="h-3 w-full" />
            <Bone className="h-3 w-11/12" />
            <Bone className="h-3 w-4/5" />
          </div>
        </div>
      </div>
    </main>
  );
}

/** Content column inside the account layout (nav and greeting stay mounted). */
export function AccountContentSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading">
      <Bone className="h-6 w-40" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-outline-variant/20 p-4"
        >
          <Bone className="h-12 w-12 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Bone className="h-4 w-1/3" />
            <Bone className="h-3 w-1/4" />
          </div>
          <Bone className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
