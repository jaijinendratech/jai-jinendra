"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { AdminIconTooltip } from "@/components/admin/AdminIconTooltip";
import type { AdminIconName } from "@/components/admin/admin-icons";
import { AdminIcon } from "@/components/admin/admin-icons";

const variantClass = {
  primary:
    "bg-primary-container text-white hover:bg-primary disabled:opacity-60",
  secondary:
    "border border-outline-variant/40 bg-white text-on-surface hover:bg-surface-container-low",
  ghost: "text-on-surface-variant hover:bg-surface-container-low hover:text-primary",
  danger: "text-red-700 hover:bg-red-50",
} as const;

type SharedProps = {
  label: string;
  icon: AdminIconName;
  variant?: keyof typeof variantClass;
  className?: string;
  disabled?: boolean;
};

export function AdminIconButton(
  props:
    | (SharedProps & {
        as?: "button";
        type?: "button" | "submit";
        onClick?: () => void;
      })
    | (SharedProps & { as: "link"; href: string }),
) {
  const { label, icon, variant = "ghost", className, disabled } = props;

  const buttonClass = cn(
    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
    variantClass[variant],
    className,
  );

  const child =
    props.as === "link" ? (
      <Link href={props.href} className={buttonClass} aria-label={label}>
        <AdminIcon name={icon} />
      </Link>
    ) : (
      <button
        type={props.type ?? "button"}
        onClick={props.onClick}
        disabled={disabled}
        className={buttonClass}
        aria-label={label}
      >
        <AdminIcon name={icon} />
      </button>
    );

  return <AdminIconTooltip label={label}>{child}</AdminIconTooltip>;
}
