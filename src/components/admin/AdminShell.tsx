"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LuLayoutDashboard,
  LuPackage,
  LuFolderTree,
  LuBoxes,
  LuWarehouse,
  LuShoppingBag,
  LuUsers,
  LuMail,
  LuTicket,
  LuFileText,
  LuImages,
  LuImage,
  LuMessageSquare,
  LuStore,
  LuSettings,
  LuLogOut,
} from "react-icons/lu";
import type { IconType } from "react-icons";
import { logoutAdminAction } from "@/lib/auth";
import { adminNav } from "@/data/admin-mock";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { siteConfig } from "@/data/home";

const groupLabels = {
  overview: "Overview",
  catalog: "Catalog",
  commerce: "Commerce",
  content: "Content",
  ops: "Operations",
} as const;

const navIcons: Record<string, IconType> = {
  "/admin": LuLayoutDashboard,
  "/admin/products": LuPackage,
  "/admin/categories": LuFolderTree,
  "/admin/combos": LuBoxes,
  "/admin/inventory": LuWarehouse,
  "/admin/orders": LuShoppingBag,
  "/admin/customers": LuUsers,
  "/admin/subscribers": LuMail,
  "/admin/coupons": LuTicket,
  "/admin/content/home": LuFileText,
  "/admin/content/carousels": LuImages,
  "/admin/media": LuImage,
  "/admin/enquiries": LuMessageSquare,
  "/admin/outlets": LuStore,
  "/admin/settings": LuSettings,
};

/** High-traffic admin routes — warm the RSC/client chunks early. */
const PREFETCH_HREFS = [
  "/admin",
  "/admin/products",
  "/admin/orders",
  "/admin/customers",
  "/admin/coupons",
  "/admin/categories",
  "/admin/inventory",
  "/admin/combos",
  "/admin/outlets",
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);

  useEffect(() => {
    for (const href of PREFETCH_HREFS) {
      router.prefetch(href);
    }
  }, [router]);

  const groups = (Object.keys(groupLabels) as (keyof typeof groupLabels)[]).map(
    (group) => ({
      group,
      label: groupLabels[group],
      items: adminNav.filter((item) => item.group === group),
    }),
  );

  return (
    <div className="min-h-dvh bg-[#f6f4f2] text-on-surface">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-64 flex-col border-r border-outline-variant/30 bg-white transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-20 shrink-0 items-center border-b border-outline-variant/20 px-4">
          <Link href="/admin" className="flex min-w-0 items-center">
            <Image
              src={siteConfig.logo.src}
              alt={siteConfig.logo.alt}
              width={siteConfig.logo.width}
              height={siteConfig.logo.height}
              className="h-14 w-auto max-w-full shrink-0 object-contain object-left"
              priority
            />
          </Link>
        </div>

        <nav
          className="flex-1 space-y-5 overflow-y-auto p-4"
          aria-label="Admin"
        >
          {groups.map(({ group, label, items }) => (
            <div key={group}>
              <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-outline">
                {label}
              </p>
              <ul className="space-y-1">
                {items.map((item) => {
                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);
                  const Icon = navIcons[item.href] ?? LuPackage;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        prefetch
                        onClick={() => setOpen(false)}
                        onMouseEnter={() => router.prefetch(item.href)}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                          active
                            ? "bg-primary text-white"
                            : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-outline-variant/20 p-4">
          <button
            type="button"
            onClick={() => setSignOutOpen(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant/40 px-3 py-2.5 text-xs font-semibold text-on-surface-variant hover:border-primary hover:text-primary"
          >
            <LuLogOut className="h-4 w-4" aria-hidden />
            Sign out
          </button>
        </div>
      </aside>

      <AdminConfirmDialog
        isOpen={signOutOpen}
        onOpenChange={setSignOutOpen}
        title="Sign out?"
        message="You will need to sign in again to manage the store."
        confirmLabel="Sign out"
        cancelLabel="Stay signed in"
        danger
        onConfirm={() => {
          void logoutAdminAction();
        }}
      />

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="flex min-h-dvh min-w-0 flex-col lg:pl-64">
        {/* <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-outline-variant/30 bg-white/95 px-4 backdrop-blur md:px-6">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant/40 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <LuX className="h-4 w-4" />
            ) : (
              <LuMenu className="h-4 w-4" />
            )}
          </button>
          <p className="text-sm text-on-surface-variant">
            Store operations console
          </p>
        </header> */}
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
