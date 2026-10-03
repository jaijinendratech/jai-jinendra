import { BrandSpinner } from "@/components/shared/BrandSpinner";

/**
 * Overrides the parent `(dashboard)/loading.tsx` just for `/admin/combos`.
 * Same overlay — kept as a separate file to preserve this route's existing
 * override point, even though the content is now identical to the parent.
 */
export default function Loading() {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-white lg:left-64">
      <BrandSpinner size={140} label="Loading page" />
    </div>
  );
}
