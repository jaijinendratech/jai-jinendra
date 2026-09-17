import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Clock } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { outletsPage } from "@/data/promise-pages";

export const metadata: Metadata = {
  title: outletsPage.metaTitle,
  description: outletsPage.metaDescription,
  alternates: { canonical: "/outlets" },
};

const typeLabel = {
  flagship: "Flagship",
  kitchen: "Heritage Kitchen",
  popup: "Seasonal Pop-Up",
} as const;

export default function OutletsPage() {
  return (
    <main className="container-jj py-6 md:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "The Promise", href: "/about" },
          { label: "Our Flagship Outlets" },
        ]}
      />

      <p className="label-sm uppercase tracking-widest text-primary">
        {outletsPage.eyebrow}
      </p>
      <h1 className="font-display mt-2 text-3xl font-semibold text-on-surface md:text-4xl">
        {outletsPage.title}
      </h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-on-surface-variant md:text-base">
        {outletsPage.intro}
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {outletsPage.outlets.map((outlet) => (
          <article
            key={outlet.id}
            className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-sm"
          >
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              {typeLabel[outlet.type]}
            </span>
            <h2 className="font-display mt-3 text-xl font-semibold text-on-surface">
              {outlet.name}
            </h2>
            <p className="mt-1 text-sm font-semibold text-on-surface-variant">{outlet.city}</p>
            <ul className="mt-4 space-y-2 text-sm text-on-surface-variant">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>{outlet.address}</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>{outlet.hours}</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <a href={`tel:${outlet.phone.replace(/\s/g, "")}`} className="hover:text-primary">
                  {outlet.phone}
                </a>
              </li>
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/corporate"
          className="inline-flex rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary"
        >
          Corporate Gifting Desk
        </Link>
        <Link
          href="/catalogue"
          className="inline-flex rounded-lg border border-primary-container px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"
        >
          Order online
        </Link>
      </div>
    </main>
  );
}
