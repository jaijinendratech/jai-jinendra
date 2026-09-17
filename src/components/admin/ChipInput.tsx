"use client";

import { useState, type KeyboardEvent } from "react";
import { LuX } from "react-icons/lu";
import { fieldClassName, labelClassName } from "@/components/admin/ui";

export function ChipInput({
  name,
  label,
  defaultValue = [],
  mode = "multi",
  placeholder = "Type and press Enter",
}: {
  name: string;
  label: string;
  defaultValue?: string[];
  mode?: "single" | "multi";
  placeholder?: string;
}) {
  const [chips, setChips] = useState<string[]>(
    mode === "single"
      ? defaultValue[0]
        ? [defaultValue[0]]
        : []
      : defaultValue,
  );
  const [draft, setDraft] = useState("");

  function commit(raw: string) {
    const value = raw.trim();
    if (!value) return;
    if (mode === "single") {
      setChips([value]);
    } else if (!chips.includes(value)) {
      setChips((prev) => [...prev, value]);
    }
    setDraft("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft.replace(/,/g, ""));
    } else if (e.key === "Backspace" && !draft && chips.length) {
      setChips((prev) => prev.slice(0, -1));
    }
  }

  const serialized =
    mode === "single" ? chips[0] ?? "" : chips.join(", ");

  return (
    <div>
      <p className={labelClassName()}>{label}</p>
      <input type="hidden" name={name} value={serialized} />
      <div
        className={`${fieldClassName()} flex min-h-11 flex-wrap items-center gap-1.5`}
      >
        {chips.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary"
          >
            {chip}
            <button
              type="button"
              aria-label={`Remove ${chip}`}
              className="rounded-full hover:bg-primary/15"
              onClick={() =>
                setChips((prev) => prev.filter((c) => c !== chip))
              }
            >
              <LuX className="h-3 w-3" />
            </button>
          </span>
        ))}
        {(mode === "multi" || chips.length === 0) && (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => commit(draft)}
            placeholder={chips.length ? "" : placeholder}
            className="min-w-24 flex-1 border-0 bg-transparent p-0 text-sm outline-none"
          />
        )}
      </div>
      <p className="mt-1 text-[11px] text-on-surface-variant">
        Press Enter to {mode === "single" ? "set badge" : "add"}
      </p>
    </div>
  );
}
