"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { AdminIconTooltip } from "@/components/admin/AdminIconTooltip";
import { statusBadgeClass, type StatusBadgeKind } from "@/lib/admin/status";

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

  return (
    <AdminIconTooltip label="Change status">
      <form
        ref={formRef}
        action={action}
        className="inline-flex"
        onClick={(e) => e.stopPropagation()}
      >
        {Object.entries(fields).map(([key, val]) => (
          <input key={key} type="hidden" name={key} value={val} />
        ))}
        <select
          name={name}
          value={current}
          disabled={disabled}
          aria-label="Change status"
          onChange={(e) => {
            setCurrent(e.target.value);
            formRef.current?.requestSubmit();
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
    </AdminIconTooltip>
  );
}
