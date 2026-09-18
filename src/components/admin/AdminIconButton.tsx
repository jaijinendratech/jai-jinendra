"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
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
  /** When true, renders a compact icon + text button (for primary Add/Save CTAs). */
  showLabel?: boolean;
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
  const {
    label,
    icon,
    variant = "ghost",
    className,
    disabled,
    showLabel = false,
  } = props;

  const buttonClass = cn(
    "inline-flex shrink-0 items-center justify-center rounded-lg transition-colors",
    showLabel
      ? "h-8 gap-1.5 px-3 text-sm font-semibold"
      : "h-8 w-8",
    variantClass[variant],
    className,
  );

  const child =
    props.as === "link" ? (
      <Link href={props.href} className={buttonClass} aria-label={label}>
        <AdminIcon name={icon} />
        {showLabel ? <span>{label}</span> : null}
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
        {showLabel ? <span>{label}</span> : null}
      </button>
    );

  if (showLabel) return child;
  return <AdminIconTooltip label={label}>{child}</AdminIconTooltip>;
}

/** Submit button that disables and shows pending label via useFormStatus. */
export function AdminFormSubmitButton({
  label,
  pendingLabel = "Saving…",
  icon,
  variant = "primary",
  className,
  disabled,
}: {
  label: string;
  pendingLabel?: string;
  icon: AdminIconName;
  variant?: keyof typeof variantClass;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <AdminIconButton
      type="submit"
      label={pending ? pendingLabel : label}
      icon={icon}
      variant={variant}
      showLabel
      disabled={disabled || pending}
      className={className}
    />
  );
}
