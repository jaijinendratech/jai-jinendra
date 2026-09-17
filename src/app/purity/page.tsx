import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { siteConfig } from "@/data/home";
import { purityPage } from "@/data/promise-pages";

export const metadata: Metadata = {
  title: purityPage.metaTitle,
  description: purityPage.metaDescription,
  alternates: { canonical: "/purity" },
};

export default function PurityPage() {
  return (
    <main className="container-jj py-6 md:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "The Promise", href: "/about" },
          { label: "Purity & Lab Testing" },
        ]}
      />

      <div className="grid items-start gap-10 lg:grid-cols-2">
        <div>
          <p className="label-sm uppercase tracking-widest text-primary">
            {purityPage.eyebrow}
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold text-on-surface md:text-4xl">
            {purityPage.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-on-surface-variant md:text-base">
            {purityPage.intro}
          </p>
          <p className="mt-3 text-sm text-on-surface-variant">
            FSSAI licensed unit{" "}
            <span className="numeric font-semibold text-on-surface">{siteConfig.fssai}</span>
          </p>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-low lg:aspect-4/3">
          <Image
            src={purityPage.image}
            alt={purityPage.imageAlt}
            fill
            sizes="(max-width:1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
      </div>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-on-surface">
          Kitchen purity pillars
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {purityPage.pillars.map((pillar) => (
            <article
              key={pillar.id}
              className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-5"
            >
              <p className="label-sm uppercase tracking-widest text-secondary">{pillar.badge}</p>
              <h3 className="font-display mt-2 text-lg font-semibold text-on-surface">
                {pillar.title}
              </h3>
              <p className="mt-1 text-xs font-semibold text-primary">{pillar.subtitle}</p>
              <p className="mt-2 text-xs leading-5 text-on-surface-variant">{pillar.detail}</p>
            </article>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {purityPage.badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-outline-variant/40 bg-surface-container-lowest px-3 py-1 text-[11px] font-semibold text-on-surface-variant"
            >
              {badge}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-6 md:p-8">
        <h2 className="font-display text-2xl font-semibold text-on-surface">
          Lab & batch checks
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {purityPage.labChecks.map((check) => (
            <article key={check.title} className="rounded-lg bg-surface-container-low p-4">
              <h3 className="text-sm font-bold text-on-surface">{check.title}</h3>
              <p className="mt-1 text-sm leading-6 text-on-surface-variant">{check.body}</p>
            </article>
          ))}
        </div>
        <Link
          href="/freshness"
          className="mt-8 inline-flex rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary"
        >
          See Freshness Guarantee
        </Link>
      </section>
    </main>
  );
}
