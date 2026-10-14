import type { Metadata } from "next";
import { SupportFaqsView } from "@/components/customer-care/SupportFaqsView";
import { supportMeta } from "@/data/customer-care";

export const metadata: Metadata = {
  title: supportMeta.title,
  description: supportMeta.description,
  alternates: { canonical: "/support" },
};

export default function SupportPage() {
  return <SupportFaqsView />;
}
