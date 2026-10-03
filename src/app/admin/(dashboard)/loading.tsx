import { BrandSpinner } from "@/components/shared/BrandSpinner";

/**
 * Admin route loading UI. Same full-white-screen + big spinner treatment as
 * the storefront's `src/app/loading.tsx`. `z-30` sits below AdminShell's
 * sidebar (`z-40`, opaque white), so the sidebar stays visible on top while
 * this overlay hides the (previously skeleton-filled) content area.
 * `lg:left-64` keeps it clear of the sidebar's docked column on large
 * screens; below `lg` the sidebar is an off-canvas drawer, so it can span
 * full width there.
 */
export default function AdminDashboardLoading() {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-white lg:left-64">
      <BrandSpinner size={140} label="Loading page" />
    </div>
  );
}
