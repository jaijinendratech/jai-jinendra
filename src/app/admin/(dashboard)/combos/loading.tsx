import { BrandLoader } from "@/components/shared/BrandLoader";

/**
 * Overrides the parent `(dashboard)/loading.tsx` for `/admin/combos`.
 * Same overlay, kept so this route retains its own loading boundary.
 */
export default function Loading() {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-background lg:left-64">
      <BrandLoader />
    </div>
  );
}
