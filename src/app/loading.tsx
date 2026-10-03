import { BrandSpinner } from "@/components/shared/BrandSpinner";

/**
 * Storefront-wide route loading UI (App Router convention). Shown while a
 * page segment is loading/streaming on navigation. Admin keeps its own
 * `loading.tsx` files under `src/app/admin/(dashboard)/`, which take
 * precedence inside that subtree.
 *
 * `fixed inset-0` + `z-40` (below `SiteHeader`'s `z-50` sticky header) means
 * this overlay paints above the announcement bar and footer — both plain
 * static elements in `layout.tsx` — while the sticky header still renders on
 * top of it. So only the header stays visible; everything else behind it is
 * hidden by this full white screen, with no changes needed to those
 * sibling components.
 */
export default function Loading() {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-white">
      <BrandSpinner size={140} label="Loading page" />
    </div>
  );
}
