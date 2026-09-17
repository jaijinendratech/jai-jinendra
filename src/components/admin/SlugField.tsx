"use client";

import { useEffect, useState } from "react";
import { LuPencil, LuLock } from "react-icons/lu";
import { fieldClassName, labelClassName } from "@/components/admin/ui";
import { slugify } from "@/lib/admin/slug";

export function SlugField({
  nameValue,
  defaultSlug = "",
  name = "slug",
}: {
  nameValue: string;
  defaultSlug?: string;
  name?: string;
}) {
  const [manual, setManual] = useState(Boolean(defaultSlug));
  const [slug, setSlug] = useState(defaultSlug || slugify(nameValue));

  useEffect(() => {
    if (!manual) setSlug(slugify(nameValue));
  }, [nameValue, manual]);

  return (
    <label className={labelClassName()}>
      <span className="flex items-center justify-between gap-2">
        Slug
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
          onClick={() => setManual((v) => !v)}
        >
          {manual ? (
            <>
              <LuLock className="h-3 w-3" /> Use auto
            </>
          ) : (
            <>
              <LuPencil className="h-3 w-3" /> Edit
            </>
          )}
        </button>
      </span>
      <input
        name={name}
        value={slug}
        onChange={(e) => {
          setManual(true);
          setSlug(e.target.value);
        }}
        required
        className={`${fieldClassName()} ${!manual ? "bg-surface-container-low" : ""}`}
      />
      {!manual ? (
        <span className="mt-1 block text-[11px] font-normal text-on-surface-variant">
          Auto-generated from name
        </span>
      ) : null}
    </label>
  );
}
