import { cn } from "@/lib/cn";

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-outline-variant/25",
        className,
      )}
      aria-hidden
    />
  );
}

/** Generic admin page skeleton shown during route transitions. */
export function AdminPageSkeleton({
  variant = "table",
}: {
  variant?: "table" | "cards" | "dashboard";
}) {
  if (variant === "dashboard") {
    return (
      <div className="space-y-6" role="status" aria-label="Loading">
        <div className="space-y-2">
          <Bone className="h-8 w-48" />
          <Bone className="h-4 w-72" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Bone key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Bone className="h-64 rounded-xl" />
      </div>
    );
  }

  if (variant === "cards") {
    return (
      <div className="space-y-6" role="status" aria-label="Loading">
        <div className="space-y-2">
          <Bone className="h-8 w-40" />
          <Bone className="h-4 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Bone key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" role="status" aria-label="Loading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <Bone className="h-8 w-44" />
          <Bone className="h-4 w-72" />
        </div>
        <Bone className="h-9 w-28 rounded-lg" />
      </div>
      <div className="flex flex-wrap gap-3">
        <Bone className="h-10 w-56 rounded-lg" />
        <Bone className="h-10 w-40 rounded-lg" />
        <Bone className="h-10 w-36 rounded-lg" />
      </div>
      <div className="overflow-hidden rounded-xl border border-outline-variant/25 bg-white shadow-sm">
        <div className="border-b border-outline-variant/20 bg-surface-container-low px-4 py-3">
          <div className="flex gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Bone key={i} className="h-3 w-16" />
            ))}
          </div>
        </div>
        <ul className="divide-y divide-outline-variant/15">
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={i} className="flex items-center gap-4 px-4 py-3.5">
              <Bone className="h-12 w-12 shrink-0 rounded-md" />
              <div className="min-w-0 flex-1 space-y-2">
                <Bone className="h-4 w-1/3 max-w-48" />
                <Bone className="h-3 w-1/4 max-w-32" />
              </div>
              <Bone className="hidden h-4 w-16 sm:block" />
              <Bone className="hidden h-4 w-14 md:block" />
              <Bone className="h-8 w-8 rounded-lg" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
