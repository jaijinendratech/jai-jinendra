import type { Metadata } from "next";
import { NotFoundContent } from "@/components/shared/NotFoundContent";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function StorefrontNotFound() {
  return <NotFoundContent />;
}
