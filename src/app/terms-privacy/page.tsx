import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { termsPrivacyContent } from "@/data/customer-care";

export const metadata: Metadata = {
  title: termsPrivacyContent.title,
  description: termsPrivacyContent.description,
  alternates: { canonical: "/terms-privacy" },
};

export default function TermsPrivacyPage() {
  return (
    <main className="container-jj py-6 md:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Terms & Privacy" },
        ]}
      />

      <p className="label-sm uppercase tracking-widest text-primary">
        Customer Care
      </p>
      <h1 className="font-display mt-2 text-3xl font-semibold text-on-surface md:text-4xl">
        {termsPrivacyContent.title}
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-on-surface-variant md:text-base">
        {termsPrivacyContent.intro}
      </p>
      <p className="mt-2 text-xs text-on-surface-variant">
        {termsPrivacyContent.updatedLabel}
      </p>

      <section id="terms" className="mt-10 scroll-mt-28">
        <h2 className="font-display text-2xl font-semibold text-on-surface">
          Terms of Use
        </h2>
        <div className="mt-4 space-y-4">
          {termsPrivacyContent.terms.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-5 md:p-6"
            >
              <h3 className="font-display text-lg font-semibold text-on-surface">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="privacy" className="mt-12 scroll-mt-28 pb-4">
        <h2 className="font-display text-2xl font-semibold text-on-surface">
          Privacy
        </h2>
        <div className="mt-4 space-y-4">
          {termsPrivacyContent.privacy.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-5 md:p-6"
            >
              <h3 className="font-display text-lg font-semibold text-on-surface">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
