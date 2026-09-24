"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "@heroui/react";
import { cn } from "@/lib/cn";
import { statusBadgeClass, type StatusBadgeKind } from "@/lib/admin/status";
import { isNextRedirectError } from "@/lib/admin/is-redirect-error";
import { useRouter } from "next/navigation";

export type AdminStatusOption = { value: string; label: string };

export const PUBLISH_DRAFT_OPTIONS: AdminStatusOption[] = [
  { value: "true", label: "Published" },
  { value: "false", label: "Draft" },
];

export const PUBLISH_HIDDEN_OPTIONS: AdminStatusOption[] = [
  { value: "true", label: "Published" },
  { value: "false", label: "Hidden" },
];

export const FEATURED_OPTIONS: AdminStatusOption[] = [
  { value: "true", label: "Featured" },
  { value: "false", label: "Standard" },
];

/** Category “special attention” — shown in storefront navbar + CTA. */
export const SPECIAL_ATTENTION_OPTIONS: AdminStatusOption[] = [
  { value: "true", label: "Special attention" },
  { value: "false", label: "Normal" },
];

export function AdminStatusSelect({
  action,
  fields,
  name = "status",
  value,
  options,
  kind,
  disabled,
}: {
  action: (formData: FormData) => void | Promise<void>;
  fields: Record<string, string>;
  name?: string;
  value: string;
  options: AdminStatusOption[];
  kind: StatusBadgeKind;
  disabled?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [current, setCurrent] = useState(value);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <form
      ref={formRef}
      className="inline-flex"
      title="Change status"
      onClick={(e) => e.stopPropagation()}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          try {
            await action(fd);
            toast.success("Status updated");
            router.refresh();
          } catch (err) {
            if (isNextRedirectError(err)) throw err;
            toast.danger(
              err instanceof Error ? err.message : "Could not update status",
            );
          }
        });
      }}
    >
      {Object.entries(fields).map(([key, val]) => (
        <input key={key} type="hidden" name={key} value={val} />
      ))}
      <select
        name={name}
        value={current}
        disabled={disabled || pending}
        aria-label="Change status"
        onChange={(e) => {
          setCurrent(e.target.value);
          queueMicrotask(() => formRef.current?.requestSubmit());
        }}
        className={cn(
          statusBadgeClass(kind, current),
          "cursor-pointer border-0 bg-none pr-1 outline-none disabled:cursor-default",
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </form>
  );
}
