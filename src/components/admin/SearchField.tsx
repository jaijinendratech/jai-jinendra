"use client";

import { useEffect, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { fieldClassName } from "@/components/admin/ui";
import { cn } from "@/lib/cn";

const DEFAULT_DEBOUNCE_MS = 280;

export function SearchField({
  value,
  onChange,
  onSubmit,
  placeholder = "Search…",
  className,
  debounceMs = DEFAULT_DEBOUNCE_MS,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
  /** Delay before notifying parent. Set `0` for immediate updates. */
  debounceMs?: number;
}) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    if (debounceMs <= 0) {
      if (local !== value) onChange(local);
      return;
    }
    const id = window.setTimeout(() => {
      if (local !== value) onChange(local);
    }, debounceMs);
    return () => window.clearTimeout(id);
    // Only re-run when the typed value or delay changes — not when parent value catches up.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: debounce local → parent
  }, [local, debounceMs]);

  function flush(next: string) {
    setLocal(next);
    onChange(next);
  }

  return (
    <div className={cn("relative max-w-xs", className)}>
      <LuSearch
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-on-surface-variant"
        aria-hidden
      />
      <input
        value={local}
        onChange={(e) => {
          const next = e.target.value;
          setLocal(next);
          if (debounceMs <= 0) onChange(next);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            flush(local);
            onSubmit?.();
          }
        }}
        placeholder={placeholder}
        className={`${fieldClassName()} mt-0! pl-9!`}
        aria-label={placeholder}
      />
    </div>
  );
}
