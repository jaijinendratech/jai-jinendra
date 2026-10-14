import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { termsContent, type TermsPart } from "@/data/terms";

export const metadata: Metadata = {
  title: termsContent.title,
  description: termsContent.description,
  alternates: { canonical: "/terms" },
};

function TermsText({ parts }: { parts: readonly TermsPart[] }) {
  return (
    <>
      {parts.map((part, index) =>
        typeof part === "string" ? (
          <span key={index}>{part}</span>
        ) : (
          <Link
            key={index}
            href={part.href}
            className="font-semibold text-primary hover:underline"
          >
            {part.text}
          </Link>
        ),
      )}
    </>
  );
}

export default function TermsPage() {
  return (
    <main className="container-jj py-6 md:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Terms & Conditions" },
        ]}
      />

      <p className="label-sm uppercase tracking-widest text-primary">
        Customer Care
      </p>
      <h1 className="font-display mt-2 text-3xl font-semibold text-on-surface md:text-4xl">
        {termsContent.title}
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-on-surface-variant md:text-base">
        {termsContent.intro}
      </p>
      <p className="mt-2 text-xs text-on-surface-variant">
        {termsContent.updatedLabel}
      </p>

      <nav
        aria-label="On this page"
        className="mt-8 rounded-xl border border-outline-variant/20 bg-surface-container-low p-5 md:p-6"
      >
        <h2 className="font-display text-lg font-semibold text-on-surface">
          On this page
        </h2>
        <ol className="mt-3 grid gap-2 sm:grid-cols-2">
          {termsContent.sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="text-sm text-primary hover:underline"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-10 space-y-4">
        {termsContent.sections.map((section) => (
          <article
            key={section.id}
            id={section.id}
            className="scroll-mt-28 rounded-xl border border-outline-variant/20 bg-surface-container-low p-5 md:p-6"
          >
            <h2 className="font-display text-lg font-semibold text-on-surface">
              {section.title}
            </h2>
            <div className="mt-2 space-y-3 text-sm leading-6 text-on-surface-variant">
              {section.paragraphs.map((paragraph, index) => (
                <p key={index}>
                  <TermsText parts={paragraph} />
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
