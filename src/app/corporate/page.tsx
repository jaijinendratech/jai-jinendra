import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CorporateEnquiryForm } from "@/components/promise/CorporateEnquiryForm";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { formatINR } from "@/lib/format";
import { corporatePage } from "@/data/promise-pages";

export const metadata: Metadata = {
  title: corporatePage.metaTitle,
  description: corporatePage.metaDescription,
  alternates: { canonical: "/corporate" },
};

export default function CorporatePage() {
  return (
    <main className="container-jj py-6 md:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "The Promise", href: "/about" },
          { label: "Corporate Gifting Desk" },
        ]}
      />

      <section className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <p className="label-sm uppercase tracking-widest text-primary">
            {corporatePage.eyebrow}
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold text-on-surface md:text-4xl">
            {corporatePage.title}
          </h1>
          <p className="mt-4 text-sm leading-7 text-on-surface-variant md:text-base">
            {corporatePage.intro}
          </p>
          <Link
            href="/hampers"
            className="mt-6 inline-flex rounded-lg border border-primary-container px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"
          >
            Browse retail hampers
          </Link>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-low">
          <Image
            src={corporatePage.image}
            alt={corporatePage.imageAlt}
            fill
            sizes="(max-width:1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
      </section>

      <section className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {corporatePage.benefits.map((item) => (
          <article
            key={item.title}
            className="rounded-xl border border-outline-variant/25 bg-surface-container-low p-5"
          >
            <h2 className="font-display text-lg font-semibold text-on-surface">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">{item.body}</p>
          </article>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold text-on-surface">
          Popular corporate starting points
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {corporatePage.packages.map((pack) => (
            <article
              key={pack.name}
              className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-5"
            >
              <h3 className="font-display text-lg font-semibold text-on-surface">{pack.name}</h3>
              <p className="mt-1 text-sm text-on-surface-variant">{pack.note}</p>
              <p className="price mt-3 text-xl font-bold text-primary">
                From {formatINR(pack.from)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 max-w-3xl">
        <CorporateEnquiryForm />
      </section>
    </main>
  );
}
