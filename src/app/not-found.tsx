import type { Metadata } from "next";
import { StorefrontChrome } from "@/components/layout/StorefrontChrome";
import { NotFoundContent } from "@/components/shared/NotFoundContent";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

/** Unmatched URLs render here, outside the (storefront) layout. */
export default function NotFound() {
  return (
    <StorefrontChrome>
      <NotFoundContent />
    </StorefrontChrome>
  );
}
