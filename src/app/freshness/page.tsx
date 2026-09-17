import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { freshnessPage } from "@/data/promise-pages";

export const metadata: Metadata = {
  title: freshnessPage.metaTitle,
  description: freshnessPage.metaDescription,
  alternates: { canonical: "/freshness" },
};

export default function FreshnessPage() {
  return (
    <main className="container-jj py-6 md:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "The Promise", href: "/about" },
          { label: "Pan-India Freshness Guarantee" },
        ]}
      />

      <section className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <p className="label-sm uppercase tracking-widest text-primary">
            {freshnessPage.eyebrow}
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold text-on-surface md:text-4xl">
            {freshnessPage.title}
          </h1>
          <p className="mt-4 text-sm leading-7 text-on-surface-variant md:text-base">
            {freshnessPage.intro}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/catalogue"
              className="inline-flex rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary"
            >
              Shop Fresh Batches
            </Link>
            <Link
              href="/shipping-returns"
              className="inline-flex rounded-lg border border-primary-container px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"
            >
              Shipping Policy
            </Link>
          </div>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-low">
          <Image
            src={freshnessPage.image}
            alt={freshnessPage.imageAlt}
            fill
            sizes="(max-width:1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
      </section>

      <section className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {freshnessPage.guarantees.map((item) => (
          <article
            key={item.title}
            className="rounded-xl border border-outline-variant/25 bg-surface-container-low p-5"
          >
            <h2 className="font-display text-lg font-semibold text-on-surface">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">{item.body}</p>
          </article>
        ))}
      </section>

      <section className="mt-12 rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-6 md:p-8">
        <h2 className="font-display text-2xl font-semibold text-on-surface">
          Typical delivery windows
        </h2>
        <ul className="mt-6 divide-y divide-outline-variant/20">
          {freshnessPage.sla.map((row) => (
            <li
              key={row.label}
              className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
            >
              <span className="text-on-surface-variant">{row.label}</span>
              <span className="numeric font-semibold text-on-surface">{row.value}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
