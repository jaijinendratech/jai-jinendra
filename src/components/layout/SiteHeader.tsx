"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, User, X } from "lucide-react";
import { useState } from "react";
import { navLinks, siteConfig } from "@/data/home";
import { CartBadge } from "@/components/cart/CartBadge";
import { SearchDialog } from "@/components/layout/SearchDialog";
import type { Product } from "@/types/catalog";

export function SiteHeader({ searchProducts = [] }: { searchProducts?: Product[] }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline-variant/30 bg-surface/90 shadow-[0_4px_20px_-4px_rgba(30,27,25,0.03)] backdrop-blur-md">
      <div className="container-jj flex h-14 items-center justify-between gap-3 md:h-20 md:gap-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 tracking-tight"
        >
          <Image
            src={siteConfig.logo.src}
            alt={siteConfig.logo.alt}
            width={siteConfig.logo.width}
            height={siteConfig.logo.height}
            className="h-9 w-auto shrink-0 object-contain md:h-14"
            sizes="(max-width: 768px) 5rem, 7rem"
            priority
          />
          <span className="sr-only">{siteConfig.name}</span>
        </Link>

        <nav
          className="hidden items-center gap-7 text-xs font-semibold uppercase tracking-wider lg:flex"
          aria-label="Primary"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative py-1.5 transition-colors ${
                link.highlight
                  ? "font-bold text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              {link.label}
              {link.href === "/hampers" ? (
                <span className="ml-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 md:gap-3">
          <SearchDialog products={searchProducts} />
          <Link
            href="/account"
            aria-label="Account"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-high hover:text-primary sm:inline-flex"
          >
            <User className="h-5 w-5" />
          </Link>
          <span className="hidden h-5 w-px bg-outline-variant/30 sm:inline-block" />
          <CartBadge />
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-primary lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-outline-variant/30 bg-surface-container-lowest px-4 py-3 lg:hidden"
        >
          <nav className="flex flex-col gap-0.5" aria-label="Mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold uppercase tracking-wide text-on-surface hover:bg-surface-container-low hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-lg px-3 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low hover:text-primary sm:hidden"
            >
              My Account
            </Link>
            <Link
              href="/catalogue"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-primary hover:bg-surface-container-low"
            >
              Shop Now
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
