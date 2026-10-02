"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, MessageCircle } from "lucide-react";
import { useState } from "react";
import { footerBrand, footerColumns, siteConfig } from "@/data/home";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 8.5V6.75c0-.55.45-1 1-1h1.5V3H14c-2.21 0-4 1.79-4 4v1.5H7.5V12H10v9h3.5v-9h2.75l.5-3.5H13.5V7c0-.28.22-.5.5-.5h2.5v-3H14c-1.93 0-3.5 1.57-3.5 3.5v1.5H14Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="16.75" cy="7.25" r="1" fill="currentColor" />
    </svg>
  );
}

function FooterAccordionColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-outline-variant/30 md:border-0">
      <button
        type="button"
        className="flex w-full items-center justify-between py-3 text-left md:pointer-events-none md:py-0"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <h3 className="font-display text-base font-semibold text-on-surface md:text-lg">
          {title}
        </h3>
        <ChevronDown
          className={`h-4 w-4 text-on-surface-variant transition md:hidden ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      <ul className={`space-y-2 pb-3 md:mt-4 md:block md:pb-0 ${open ? "block" : "hidden"}`}>
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-on-surface-variant transition hover:text-primary"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter({
  categoryLinks = [],
}: {
  categoryLinks?: { label: string; href: string }[];
}) {
  const columns = footerColumns.map((column) =>
    column.title === "Categories" && categoryLinks.length > 0
      ? {
          ...column,
          links: [
            ...categoryLinks,
            { label: "Full Catalogue", href: "/catalogue" },
          ],
        }
      : column,
  );

  return (
    <footer className="border-t border-outline-variant/40 bg-surface-container-high">
      <div className="container-jj grid gap-6 py-8 md:grid-cols-2 md:gap-10 md:py-12 lg:grid-cols-3">
        <div>
          <Link href="/" className="inline-flex shrink-0">
            <Image
              src={siteConfig.logo.src}
              alt={siteConfig.logo.alt}
              width={siteConfig.logo.width}
              height={siteConfig.logo.height}
              className="h-12 w-auto shrink-0 object-contain md:h-14"
              sizes="7rem"
            />
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-6 text-on-surface-variant md:mt-4">
            <span className="md:hidden">{footerBrand.mobileBody}</span>
            <span className="hidden md:inline">{footerBrand.body}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2 md:mt-4">
            <a
              href={siteConfig.social.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label="Follow Jai Jinendra on Facebook"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-lowest text-on-surface-variant transition hover:border-primary/40 hover:text-primary"
            >
              <FacebookIcon className="h-4 w-4" />
            </a>
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Follow Jai Jinendra on Instagram"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-lowest text-on-surface-variant transition hover:border-primary/40 hover:text-primary"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
          </div>
          <Link
            href="/support"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-white md:hidden"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Chat Support
          </Link>
          <a
            href={`tel:${siteConfig.phone}`}
            className="mt-2 block text-xs font-semibold text-primary md:hidden"
          >
            Helpline: {siteConfig.phone}
          </a>
        </div>

        {columns.map((column) => (
          <FooterAccordionColumn
            key={column.title}
            title={column.title}
            links={column.links}
          />
        ))}
      </div>

      <div className="border-t border-outline-variant/30">
        <div className="container-jj flex flex-col items-start justify-between gap-2 py-4 text-[11px] text-on-surface-variant md:flex-row md:items-center md:gap-3 md:py-5 md:text-xs">
          <p>
            © {new Date().getFullYear()} {siteConfig.legalName}. All Rights Reserved.
          </p>
          <p className="hidden md:block">
            Pure Vegetarian (100% Shuddh). UPI · Visa / Mastercard · NetBanking · Cash on Delivery
          </p>
          <p className="md:hidden">UPI · Cards · NetBanking · COD</p>
        </div>
      </div>
    </footer>
  );
}
