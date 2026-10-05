import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { siteConfig } from "@/data/home";
import { flagshipOutlets } from "@/data/promise-pages";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Contact ${siteConfig.name} for orders, catering, outlets, and customer support.`,
  alternates: { canonical: "/contact" },
};

const flagship = flagshipOutlets.find((o) => o.type === "flagship") ?? flagshipOutlets[0];
const outletPhones = [...new Set(flagshipOutlets.map((o) => o.phone))];

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

export default function ContactPage() {
  return (
    <main className="container-jj py-6 md:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact us" }]} />

      <p className="label-sm uppercase tracking-widest text-primary">Contact us</p>
      <h1 className="font-display mt-2 text-3xl font-semibold text-on-surface md:text-4xl">
        We are here to help
      </h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-on-surface-variant md:text-base">
        Reach the {siteConfig.name} team for orders, catering, and store visits. Visit us at our
        Kota flagship or call any of the numbers below.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold text-on-surface">Flagship address</h2>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">{flagship.address}</p>
          <a
            href={flagship.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex text-sm font-semibold text-primary hover:text-primary-container"
          >
            Get directions
          </a>
        </section>
        <section className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold text-on-surface">Call us</h2>
          <ul className="mt-2 space-y-2">
            <li>
              <a
                href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
                className="inline-flex text-sm font-semibold text-primary hover:text-primary-container"
              >
                {siteConfig.phone}
              </a>
              <span className="ml-2 text-xs text-on-surface-variant">Customer care</span>
            </li>
            {outletPhones.map((phone) => (
              <li key={phone}>
                <a
                  href={telHref(phone)}
                  className="inline-flex text-sm font-semibold text-primary hover:text-primary-container"
                >
                  {displayPhone(phone)}
                </a>
                <span className="ml-2 text-xs text-on-surface-variant">Outlet</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-sm md:col-span-2">
          <h2 className="font-display text-xl font-semibold text-on-surface">Email us</h2>
          <a
            href={`mailto:${siteConfig.email}`}
            className="mt-2 inline-flex text-sm font-semibold text-primary hover:text-primary-container"
          >
            {siteConfig.email}
          </a>
        </section>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/support"
          className="inline-flex rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary"
        >
          Customer support
        </Link>
        <Link
          href="/outlets"
          className="inline-flex rounded-lg border border-primary-container px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"
        >
          Our outlets
        </Link>
      </div>
    </main>
  );
}
