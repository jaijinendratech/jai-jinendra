import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Clock, ExternalLink } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { outletsPage } from "@/data/promise-pages";

export const metadata: Metadata = {
  title: outletsPage.metaTitle,
  description: outletsPage.metaDescription,
  alternates: { canonical: "/outlets" },
};

function telHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const national = digits.length === 10 ? digits : digits.replace(/^91/, "");
  return `tel:+91${national}`;
}

function displayPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const national = digits.length === 10 ? digits : digits.replace(/^91/, "");
  if (national.length === 10) {
    return `+91 ${national.slice(0, 5)} ${national.slice(5)}`;
  }
  return phone;
}

export default function OutletsPage() {
  return (
    <main className="container-jj py-6 md:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "About us", href: "/about" },
          { label: "Our Outlets in Kota" },
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

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {outletsPage.outlets.map((outlet) => (
          <article
            key={outlet.id}
            className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-sm"
          >
            {outlet.type === "flagship" ? (
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                Flagship
              </span>
            ) : null}
            <h2
              className={`font-display text-xl font-semibold text-on-surface${outlet.type === "flagship" ? " mt-3" : ""}`}
            >
              {outlet.name}
            </h2>
            <p className="mt-1 text-sm font-semibold text-on-surface-variant">{outlet.city}</p>
            <ul className="mt-4 space-y-2 text-sm text-on-surface-variant">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>{outlet.address}</span>
              </li>
              {outlet.hours ? (
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span>{outlet.hours}</span>
                </li>
              ) : null}
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <a href={telHref(outlet.phone)} className="hover:text-primary">
                  {displayPhone(outlet.phone)}
                </a>
              </li>
            </ul>
            <a
              href={outlet.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-container"
            >
              Get directions
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
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
