import { BrandLoader } from "@/components/shared/BrandLoader";

/**
 * Admin route loading UI. `z-30` sits below AdminShell's sidebar (`z-40`),
 * so the sidebar stays visible. `lg:left-64` clears the docked sidebar;
 * below `lg` the sidebar is an off-canvas drawer.
 */
export default function AdminDashboardLoading() {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-background lg:left-64">
      <BrandLoader />
    </div>
  );
}
