import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { siteConfig } from "@/data/home";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Contact ${siteConfig.name} for orders, catering, outlets, and customer support.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main className="container-jj py-6 md:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact us" }]} />

      <p className="label-sm uppercase tracking-widest text-primary">Contact us</p>
      <h1 className="font-display mt-2 text-3xl font-semibold text-on-surface md:text-4xl">
        We are here to help
      </h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-on-surface-variant md:text-base">
        This contact page is being finalized. Until the full form and department details are ready,
        you can reach the {siteConfig.name} team through the contact options below.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold text-on-surface">Call us</h2>
          <a
            href={`tel:${siteConfig.phone}`}
            className="mt-2 inline-flex text-sm font-semibold text-primary hover:text-primary-container"
          >
            {siteConfig.phone}
          </a>
        </section>
        <section className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold text-on-surface">Email us</h2>
          <a
            href={`mailto:${siteConfig.email}`}
            className="mt-2 inline-flex text-sm font-semibold text-primary hover:text-primary-container"
          >
            {siteConfig.email}
          </a>
        </section>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/support"
          className="inline-flex rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary"
        >
          Customer support
        </Link>
        <Link
          href="/outlets"
          className="inline-flex rounded-lg border border-primary-container px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"
        >
          Our outlets
        </Link>
      </div>
    </main>
  );
}
