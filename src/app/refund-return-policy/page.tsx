import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { refundReturnPolicyContent } from "@/data/refund-policy";

export const metadata: Metadata = {
  title: refundReturnPolicyContent.title,
  description: refundReturnPolicyContent.description,
  alternates: { canonical: "/refund-return-policy" },
};

export default function RefundReturnPolicyPage() {
  return (
    <main className="container-jj py-6 md:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Refund & Return Policy" },
        ]}
      />

      <p className="label-sm uppercase tracking-widest text-primary">Customer Care</p>
      <h1 className="font-display mt-2 text-3xl font-semibold text-on-surface md:text-4xl">
        {refundReturnPolicyContent.title}
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-on-surface-variant md:text-base">
        {refundReturnPolicyContent.intro}
      </p>
      <p className="mt-2 text-xs text-on-surface-variant">
        {refundReturnPolicyContent.updatedLabel}. See also{" "}
        <Link href="/shipping-returns" className="font-semibold text-primary hover:underline">
          Shipping & Returns
        </Link>
        .
      </p>

      <div className="mt-10 space-y-8">
        {refundReturnPolicyContent.sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="scroll-mt-28 rounded-xl border border-outline-variant/20 bg-surface-container-low p-6 md:p-8"
          >
            <h2 className="font-display text-xl font-semibold text-on-surface md:text-2xl">
              {section.title}
            </h2>
            <div className="mt-3 space-y-3 text-sm leading-6 text-on-surface-variant">
              {section.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
