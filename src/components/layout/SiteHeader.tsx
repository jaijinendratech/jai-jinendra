"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, User, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { navLinks, siteConfig } from "@/data/home";
import { CartBadge } from "@/components/cart/CartBadge";
import { SearchDialog } from "@/components/layout/SearchDialog";
import type { SearchProductHit } from "@/lib/catalog/cached";
import type { SpecialAttentionCategory } from "@/lib/catalog/queries";
import { resolveCategorySlug } from "@/lib/catalog/aliases";

/** Normalize nav hrefs so /sweets and /catalogue/sweets (or namkeen/namkeens) match. */
function navCategoryKey(href: string): string {
  const cleaned = href.replace(/\/$/, "");
  const segment = cleaned.includes("/catalogue/")
    ? (cleaned.split("/catalogue/")[1] ?? cleaned)
    : cleaned.replace(/^\//, "");
  const first = segment.split("/")[0] ?? segment;
  return resolveCategorySlug(first) ?? first.toLowerCase();
}

function isActiveHref(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (pathname === href || pathname.startsWith(`${href}/`)) return true;
  return navCategoryKey(pathname) === navCategoryKey(href);
}

export function SiteHeader({
  searchProducts = [],
  specialAttention = [],
  categoryLinks = [],
}: {
  searchProducts?: SearchProductHit[];
  specialAttention?: SpecialAttentionCategory[];
  categoryLinks?: { label: string; href: string; special?: boolean }[];
}) {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const pill = isScrolled && !open;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = useMemo(() => {
    const attentionByKey = new Map(
      specialAttention.map((c) => [navCategoryKey(c.href), c] as const),
    );
    const source =
      categoryLinks.length > 0
        ? [
            ...categoryLinks,
            { label: "Catering", href: "/catering", special: false },
          ]
        : navLinks;

    return source.map((link) => ({
      label: link.label,
      href: link.href,
      special:
        "special" in link && link.special != null
          ? link.special
          : attentionByKey.has(navCategoryKey(link.href)),
    }));
  }, [categoryLinks, specialAttention]);

  return (
    <header className="pointer-events-none sticky top-0 z-50 w-full">
      <div
        className={`pointer-events-auto mx-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          pill
            ? "mt-3 max-w-5xl rounded-full border-[1.5px] border-on-surface bg-white/50 shadow-lg backdrop-blur-xl backdrop-saturate-150"
            : "mt-0 w-full max-w-none rounded-none border-b border-outline-variant/30 bg-surface/90 shadow-[0_4px_20px_-4px_rgba(30,27,25,0.03)] backdrop-blur-md"
        }`}
      >
        <div
          className={`container-jj flex items-center justify-between gap-3 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            pill ? "h-12 md:h-14 md:gap-3" : "h-14 md:h-20 md:gap-4"
          }`}
        >
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3 tracking-tight"
          >
            <Image
              src={siteConfig.logo.src}
              alt={siteConfig.logo.alt}
              width={siteConfig.logo.width}
              height={siteConfig.logo.height}
              className={`w-auto shrink-0 object-contain transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                pill ? "h-8 md:h-10" : "h-9 md:h-14"
              }`}
              sizes="(max-width: 768px) 5rem, 7rem"
              priority
            />
            <span className="sr-only">{siteConfig.name}</span>
          </Link>

          <nav
            className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-wider xl:flex"
            aria-label="Primary"
          >
            {links.map((link) => {
              const active = isActiveHref(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative py-1.5 transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:bg-primary after:transition-transform after:duration-300 after:ease-out ${
                    active
                      ? "font-bold text-primary after:scale-x-100"
                      : "text-on-surface-variant after:scale-x-0 hover:text-primary"
                  }`}
                >
                  {link.label}
                  {link.special ? (
                    <Image
                      src="/images/special-star.png"
                      alt=""
                      width={16}
                      height={16}
                      unoptimized
                      className="absolute -right-3 -top-1.5 h-3.5 w-3.5 object-contain"
                      aria-hidden
                    />
                  ) : null}
                </Link>
              );
            })}
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
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-primary xl:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-transparent xl:hidden"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-nav"
            className="pointer-events-auto absolute top-full right-0 z-50 w-max max-w-[calc(100vw-1.5rem)] origin-right animate-[nav-slide-in_220ms_ease-out] rounded-bl-2xl border-b border-l border-outline-variant/30 bg-surface-container-lowest px-2 py-3 shadow-lg xl:hidden"
          >
          <nav className="flex w-max flex-col gap-0.5" aria-label="Mobile">
            {links.map((link) => {
              const active = isActiveHref(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold uppercase tracking-wide transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-on-surface hover:bg-surface-container-low hover:text-primary"
                  }`}
                >
                  {link.label}
                  {link.special ? (
                    <Image
                      src="/images/special-star.png"
                      alt=""
                      width={16}
                      height={16}
                      unoptimized
                      className="ml-2 inline-block h-4 w-4 object-contain align-text-top"
                      aria-hidden
                    />
                  ) : null}
                </Link>
              );
            })}
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="mt-1 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low hover:text-primary sm:hidden"
            >
              My Account
            </Link>
            <Link
              href="/catalogue"
              onClick={() => setOpen(false)}
              className="whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold text-primary hover:bg-surface-container-low"
            >
              Shop Now
            </Link>
          </nav>
          </div>
        </>
      ) : null}
    </header>
  );
}
