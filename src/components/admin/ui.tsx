import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { statusBadgeClass } from "@/lib/admin/status";

export {
  fieldClassName,
  labelClassName,
  primaryBtnClassName,
  secondaryBtnClassName,
} from "@/components/admin/styles";

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-on-surface-variant">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminCard({
  children,
  className,
  title,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-outline-variant/25 bg-white p-5 shadow-sm",
        className,
      )}
    >
      {title ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-on-surface">{title}</h2>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function AdminEmpty({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-outline-variant/40 bg-white px-6 py-12 text-center">
      <p className="text-sm font-semibold text-on-surface">{title}</p>
      {description ? (
        <p className="max-w-sm text-xs text-on-surface-variant">{description}</p>
      ) : null}
      {action}
    </div>
  );
}

export function AdminTableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-outline-variant/25 bg-white shadow-sm">
      {children}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-outline-variant/25 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">
        {label}
      </p>
      <p className="price mt-2 text-xl font-bold text-primary sm:text-2xl">{value}</p>
      {hint ? (
        <p className="mt-1 text-[11px] text-on-surface-variant">{hint}</p>
      ) : null}
    </div>
  );
}

export function StatusBadge({
  kind,
  value,
  label,
}: {
  kind: "order" | "payment" | "enquiry" | "stock";
  value: string;
  label?: string;
}) {
  return (
    <span className={statusBadgeClass(kind, value)}>
      {label ?? value.replace(/_/g, " ")}
    </span>
  );
}

export function NoticeBanner({
  notice,
  error,
}: {
  notice?: string;
  error?: string;
}) {
  if (!notice && !error) return null;
  const text =
    error === "has-products"
      ? "Cannot delete a category that still has products."
      : notice === "supabase-required"
        ? "Connect Supabase to persist changes. Viewing mock/static data for now."
        : error || notice;
  return (
    <p
      className={cn(
        "rounded-lg border px-3 py-2 text-sm",
        error
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-amber-200 bg-amber-50 text-amber-900",
      )}
    >
      {text}
    </p>
  );
}
