import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { heritagePage } from "@/data/promise-pages";

export const metadata: Metadata = {
  title: heritagePage.metaTitle,
  description: heritagePage.metaDescription,
  alternates: { canonical: "/heritage" },
};

export default function HeritagePage() {
  return (
    <main className="container-jj py-6 md:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "The Promise", href: "/about" },
          { label: "Our Heritage Story" },
        ]}
      />

      <section className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <p className="label-sm uppercase tracking-widest text-primary">
            {heritagePage.eyebrow}
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold text-on-surface md:text-4xl lg:text-5xl">
            {heritagePage.title}
          </h1>
          <p className="font-display mt-3 text-xl font-semibold text-primary md:text-2xl">
            {heritagePage.displayTitle}
          </p>
          <p className="mt-4 text-sm leading-7 text-on-surface-variant md:text-base">
            {heritagePage.body}
          </p>
          <div className="mt-6 flex flex-wrap gap-6">
            {heritagePage.stats.map((stat) => (
              <div key={stat.label}>
                <p className="numeric text-3xl font-semibold text-primary">{stat.value}</p>
                <p className="mt-1 max-w-48 text-xs text-on-surface-variant">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/catalogue"
              className="inline-flex rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary"
            >
              Explore the Catalogue
            </Link>
            <Link
              href="/purity"
              className="inline-flex rounded-lg border border-primary-container px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"
            >
              Purity Standards
            </Link>
          </div>
        </div>
        <div className="relative aspect-4/5 overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-low">
          <Image
            src={heritagePage.image}
            alt={heritagePage.imageAlt}
            fill
            sizes="(max-width:1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
      </section>

      <section className="mt-16 border-t border-outline-variant/20 pt-12">
        <h2 className="font-display text-2xl font-semibold text-on-surface md:text-3xl">
          A timeline of craft
        </h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-2">
          {heritagePage.timeline.map((item) => (
            <li
              key={item.year}
              className="rounded-xl border border-outline-variant/25 bg-surface-container-low p-5"
            >
              <p className="numeric text-sm font-bold text-primary">{item.year}</p>
              <h3 className="font-display mt-1 text-lg font-semibold text-on-surface">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-on-surface">
          Kitchen craft pillars
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {heritagePage.craftPillars.map((pillar) => (
            <article
              key={pillar.title}
              className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-5"
            >
              <h3 className="font-display text-lg font-semibold text-on-surface">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">{pillar.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
