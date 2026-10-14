import type { Metadata } from "next";
import { TrackOrderForm } from "@/components/customer-care/TrackOrderForm";
import { trackOrderMeta } from "@/data/customer-care";

export const metadata: Metadata = {
  title: trackOrderMeta.title,
  description: trackOrderMeta.description,
  alternates: { canonical: "/track-order" },
};

export default function TrackOrderPage() {
  return <TrackOrderForm />;
}
