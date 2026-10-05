"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { signOutAction } from "@/lib/auth";
import { cn } from "@/lib/cn";

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
      </ul>

      <form action={signOutAction} className="hidden md:block">
        <button
          type="submit"
          className="flex w-full items-center gap-2 rounded-lg border border-outline-variant/40 px-3 py-2 text-sm font-semibold text-on-surface-variant hover:border-primary hover:text-primary"
        >
          <LogOut className="size-[18px] shrink-0" aria-hidden />
          Sign out
        </button>
      </form>
    </nav>
  );
}
