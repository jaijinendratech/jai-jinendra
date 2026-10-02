import type { Metadata } from "next";
import { getVideoTestimonials } from "@/lib/admin/queries";
import { AdminPageHeader, NoticeBanner } from "@/components/admin/ui";
import { TestimonialsEditor } from "./TestimonialsEditor";

export const metadata: Metadata = {
  title: "Admin · Video testimonials",
  robots: { index: false, follow: false },
};

export default async function AdminTestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { notice, error } = await searchParams;
  const testimonials = await getVideoTestimonials();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Video testimonials"
        description="Customer video stories shown on the homepage."
      />
      <NoticeBanner notice={notice} error={error} />
      <TestimonialsEditor initial={testimonials} />
    </div>
  );
}
