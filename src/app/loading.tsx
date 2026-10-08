import { BrandLoader } from "@/components/shared/BrandLoader";

/**
 * Storefront route loading UI. Sits above the header (`z-50`), announcement
 * bar, footer, offer popup, and toasts so none of them show through.
 */
export default function Loading() {
  return (
    <>
      <div className="fixed inset-0 z-[200] flex items-center justify-center overscroll-none bg-background">
        <BrandLoader />
      </div>
      {/* In-flow spacer: keeps the footer below the fold until content streams in (prevents CLS). */}
      <div className="min-h-svh" aria-hidden />
    </>
  );
}
