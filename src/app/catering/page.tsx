import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { siteConfig } from "@/data/home";

export const metadata: Metadata = {
  title: "Catering",
  description: `Catering services from ${siteConfig.name} for family gatherings, weddings, and festive events.`,
  alternates: { canonical: "/catering" },
};

export default function CateringPage() {
  return (
    <main className="container-jj py-6 md:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Catering" }]} />

      <p className="label-sm uppercase tracking-widest text-primary">Catering</p>
      <h1 className="font-display mt-2 text-3xl font-semibold text-on-surface md:text-4xl">
        Celebration menus, prepared the Jai Jinendra way
      </h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-on-surface-variant md:text-base">
        We are preparing a dedicated catering experience for weddings, family functions, office
        gatherings, and festive occasions. For now, reach out to our team and we will help you plan
        a menu around authentic namkeens, mithai, bakery favourites, and gifting trays.
      </p>

      <div className="mt-10 rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-sm">
        <h2 className="font-display text-xl font-semibold text-on-surface">
          Custom catering details coming soon
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
          This page is a placeholder while we finalize packages, serving formats, and enquiry
          details for catering requests.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/contact"
          className="inline-flex rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary"
        >
          Contact us
        </Link>
        <Link
          href="/catalogue"
          className="inline-flex rounded-lg border border-primary-container px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"
        >
          Browse catalogue
        </Link>
      </div>
    </main>
  );
}
