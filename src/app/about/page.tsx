import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { siteConfig } from "@/data/home";
import { promiseHubLinks } from "@/data/promise-pages";

export const metadata: Metadata = {
  title: "The Promise",
  description: `Explore heritage, purity, freshness, corporate gifting, and flagship outlets from ${siteConfig.name}.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="container-jj py-6 md:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "The Promise" }]} />

      <p className="label-sm uppercase tracking-widest text-primary">The Promise</p>
      <h1 className="font-display mt-2 text-3xl font-semibold text-on-surface md:text-4xl">
        Heritage, purity, and pan-India care
      </h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-on-surface-variant md:text-base">
        {siteConfig.name} is built on shuddh vegetarian kitchens, nitrogen-sealed freshness, and
        generational Rajasthani craft. Explore each promise in full — or shop the catalogue
        whenever you are ready.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promiseHubLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex flex-col justify-between rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-6 transition hover:border-primary/40 hover:shadow-sm"
          >
            <div>
              <h2 className="font-display text-xl font-semibold text-on-surface group-hover:text-primary">
                {link.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">{link.body}</p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Read more
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
        ))}
      </div>

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
