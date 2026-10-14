import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { shippingReturnsContent } from "@/data/customer-care";

export const metadata: Metadata = {
  title: shippingReturnsContent.title,
  description: shippingReturnsContent.description,
  alternates: { canonical: "/shipping-returns" },
};

export default function ShippingReturnsPage() {
  return (
    <main className="container-jj py-6 md:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shipping & Returns" },
        ]}
      />

      <p className="label-sm uppercase tracking-widest text-primary">
        Customer Care
      </p>
      <h1 className="font-display mt-2 text-3xl font-semibold text-on-surface md:text-4xl">
        {shippingReturnsContent.title}
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-on-surface-variant md:text-base">
        {shippingReturnsContent.intro}
      </p>

      <div className="mt-10 space-y-8">
        {shippingReturnsContent.sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="scroll-mt-28 rounded-xl border border-outline-variant/20 bg-surface-container-low p-6 md:p-8"
          >
            <h2 className="font-display text-xl font-semibold text-on-surface md:text-2xl">
              {section.title}
            </h2>
            <div className="mt-3 space-y-3 text-sm leading-6 text-on-surface-variant">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
