"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, MessageCircle } from "lucide-react";
import { useState } from "react";
import { footerBrand, footerColumns, siteConfig } from "@/data/home";

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

export function SiteFooter() {
  return (
    <footer className="border-t border-outline-variant/40 bg-surface-container-high">
      <div className="container-jj grid gap-6 py-8 md:grid-cols-2 md:gap-10 md:py-12 lg:grid-cols-4">
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
            <span className="rounded-full border border-secondary/30 bg-secondary-container/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-on-secondary-container">
              100% Shuddh Pure Veg
            </span>
            <span className="hidden rounded-full border border-outline-variant/40 bg-surface-container-lowest px-3 py-1 text-[11px] font-semibold text-on-surface-variant md:inline">
              FSSAI Lic #{siteConfig.fssai}
            </span>
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

        {footerColumns.map((column) => (
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
