import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { aboutPage } from "@/data/about";
import { promiseHubLinks } from "@/data/promise-pages";

export const metadata: Metadata = {
  title: aboutPage.metaTitle,
  description: aboutPage.metaDescription,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="container-jj py-6 md:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About us" }]} />

      <section className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <p className="label-sm uppercase tracking-widest text-primary">
            {aboutPage.eyebrow}
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold text-on-surface md:text-4xl lg:text-5xl">
            {aboutPage.title}
          </h1>
          <p className="mt-4 text-sm leading-7 text-on-surface-variant md:text-base">
            {aboutPage.intro}
          </p>
        </div>
        <div className="relative aspect-4/5 overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-low">
          <Image
            src={aboutPage.image}
            alt={aboutPage.imageAlt}
            fill
            sizes="(max-width:1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
      </section>

      <div className="mt-16 space-y-14 border-t border-outline-variant/20 pt-12">
        {aboutPage.sections.map((section, index) => (
          <section
            key={section.id}
            className={`max-w-3xl ${index % 2 === 1 ? "md:ml-auto md:text-right" : ""}`}
          >
            <h2 className="font-display text-2xl font-semibold text-on-surface md:text-3xl">
              {section.title}
            </h2>
            <div className={`mt-4 space-y-4 text-sm leading-7 text-on-surface-variant md:text-base ${index % 2 === 1 ? "md:ml-auto" : ""}`}>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>
            {"cta" in section && section.cta ? (
              <Link
                href={section.cta.href}
                className={`mt-6 inline-flex items-center gap-1 rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary ${index % 2 === 1 ? "md:ml-auto" : ""}`}
              >
                {section.cta.label}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            ) : null}
          </section>
        ))}
      </div>

      <section className="mt-16 border-t border-outline-variant/20 pt-12">
        <h2 className="font-display text-2xl font-semibold text-on-surface md:text-3xl">
          Explore our promise
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-on-surface-variant md:text-base">
          Heritage, purity, freshness, corporate gifting, and our Kota outlets — each promise in
          full.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promiseHubLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex flex-col justify-between rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-6 transition hover:border-primary/40 hover:shadow-sm"
            >
              <div>
                <h3 className="font-display text-xl font-semibold text-on-surface group-hover:text-primary">
                  {link.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">{link.body}</p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Read more
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/catalogue"
          className="inline-flex rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary"
        >
          Explore the Catalogue
        </Link>
        <Link
          href="/support"
          className="inline-flex rounded-lg border border-primary-container px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"
        >
          Customer Support
        </Link>
      </div>
    </main>
  );
}
