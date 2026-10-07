"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { fieldClassName } from "@/components/admin/ui";

export type FestiveProductOption = {
  id: string;
  name: string;
  category: string;
  image: string | null;
};

/** Ordered product picker. Submits the chosen ids as JSON in a hidden field. */
export function FestiveProductPicker({
  options,
  selected,
  onChange,
  max,
}: {
  options: FestiveProductOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
  max: number;
}) {
  const [query, setQuery] = useState("");
  const byId = useMemo(() => new Map(options.map((o) => [o.id, o])), [options]);
  const chosen = selected
    .map((id) => byId.get(id))
    .filter((o): o is FestiveProductOption => Boolean(o));
  const full = chosen.length >= max;

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return options
      .filter((o) => !selected.includes(o.id) && o.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [options, selected, query]);

  function move(index: number, dir: -1 | 1) {
    const next = [...selected];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <input
        type="hidden"
        name="festiveProductIds"
        value={JSON.stringify(selected)}
      />

      <ol className="space-y-2">
        {chosen.map((p, i) => (
          <li
            key={p.id}
            className="flex items-center gap-3 rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 py-2 text-sm"
          >
            <span className="w-5 text-xs font-bold text-on-surface-variant">
              {i + 1}
            </span>
            <span className="min-w-0 flex-1 truncate font-semibold">
              {p.name}
            </span>
            <span className="hidden text-xs text-on-surface-variant sm:inline">
              {p.category}
            </span>
            <button
              type="button"
              aria-label="Move up"
              disabled={i === 0}
              onClick={() => move(i, -1)}
              className="rounded p-1 hover:bg-surface-container-low disabled:opacity-30"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Move down"
              disabled={i === chosen.length - 1}
              onClick={() => move(i, 1)}
              className="rounded p-1 hover:bg-surface-container-low disabled:opacity-30"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={`Remove ${p.name}`}
              onClick={() => onChange(selected.filter((id) => id !== p.id))}
              className="rounded p-1 text-primary hover:bg-surface-container-low"
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
        {chosen.length === 0 ? (
          <li className="rounded-lg border border-dashed border-outline-variant/50 px-3 py-4 text-center text-xs text-on-surface-variant">
            No products picked. The section falls back to products tagged
            &ldquo;Navratri&rdquo; (then &ldquo;Seasonal&rdquo;).
          </li>
        ) : null}
      </ol>

      {full ? (
        <p className="text-xs text-on-surface-variant">
          Maximum of {max} products shown. Remove one to add another.
        </p>
      ) : (
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products to add…"
            className={fieldClassName()}
          />
          {matches.length > 0 ? (
            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-outline-variant/40 bg-white shadow-lg">
              {matches.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange([...selected, m.id]);
                      setQuery("");
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-container-low"
                  >
                    <Plus className="h-4 w-4 text-primary" />
                    <span className="flex-1 truncate">{m.name}</span>
                    <span className="text-xs text-on-surface-variant">
                      {m.category}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </div>
  );
}
