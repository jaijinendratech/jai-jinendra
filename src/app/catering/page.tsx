import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CateringEnquiryForm } from "@/components/promise/CateringEnquiryForm";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { cateringPage } from "@/data/promise-pages";

export const metadata: Metadata = {
  title: cateringPage.metaTitle,
  description: cateringPage.metaDescription,
  alternates: { canonical: "/catering" },
};

export default function CateringPage() {
  return (
    <main className="container-jj py-6 md:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Catering" },
        ]}
      />

      <section className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <p className="label-sm uppercase tracking-widest text-primary">
            {cateringPage.eyebrow}
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold text-on-surface md:text-4xl">
            {cateringPage.title}
          </h1>
          <p className="mt-4 text-sm leading-7 text-on-surface-variant md:text-base">
            {cateringPage.intro}
          </p>
          <Link
            href="/sweets"
            className="mt-6 inline-flex rounded-lg border border-primary-container px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"
          >
            Browse our sweets
          </Link>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-low">
          <Image
            src={cateringPage.image}
            alt={cateringPage.imageAlt}
            fill
            sizes="(max-width:1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
      </section>

      <section className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cateringPage.benefits.map((item) => (
          <article
            key={item.title}
            className="rounded-xl border border-outline-variant/25 bg-surface-container-low p-5"
          >
            <h2 className="font-display text-lg font-semibold text-on-surface">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">{item.body}</p>
          </article>
        ))}
      </section>

      <section className="mt-12 max-w-3xl">
        <CateringEnquiryForm />
      </section>
    </main>
  );
}
