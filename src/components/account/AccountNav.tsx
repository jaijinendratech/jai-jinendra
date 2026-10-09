"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Store,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { signOutAction } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";

const NAV: {
  href: string;
  label: string;
  exact?: boolean;
  icon: LucideIcon;
}[] = [
  { href: "/account", label: "Overview", exact: true, icon: LayoutDashboard },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/profile", label: "Profile", icon: UserRound },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
];

export function AccountNav() {
  const pathname = usePathname();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const signOutForm = useRef<HTMLFormElement>(null);

  return (
    <nav aria-label="Account" className="space-y-4">
      <ul className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition",
                  active
                    ? "bg-primary text-white"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary",
                )}
              >
                <Icon className="size-[18px] shrink-0" aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
        <li className="shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary"
          >
            <Store className="size-[18px] shrink-0" aria-hidden />
            Back to store
          </Link>
        </li>
      </ul>

      <form ref={signOutForm} action={signOutAction}>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="flex w-full items-center gap-2 rounded-lg border border-outline-variant/40 px-3 py-2 text-sm font-semibold text-on-surface-variant hover:border-primary hover:text-primary"
        >
          <LogOut className="size-[18px] shrink-0" aria-hidden />
          Sign out
        </button>
      </form>

      <AdminConfirmDialog
        isOpen={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Sign out?"
        message="You will need to sign in again to view your orders or check out."
        confirmLabel="Sign out"
        cancelLabel="Stay signed in"
        danger={false}
        onConfirm={() => {
          setConfirmOpen(false);
          signOutForm.current?.requestSubmit();
        }}
      />
    </nav>
  );
}
