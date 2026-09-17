"use client";

import { LuSearch } from "react-icons/lu";
import { fieldClassName } from "@/components/admin/ui";
import { cn } from "@/lib/cn";

export function SearchField({
  value,
  onChange,
  onSubmit,
  placeholder = "Search…",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative max-w-xs", className)}>
      <LuSearch
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-on-surface-variant"
        aria-hidden
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit?.()}
        placeholder={placeholder}
        className={`${fieldClassName()} mt-0! pl-9!`}
        aria-label={placeholder}
      />
    </div>
  );
}
