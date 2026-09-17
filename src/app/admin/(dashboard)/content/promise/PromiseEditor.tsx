"use client";

import { useState } from "react";
import { fieldClassName } from "@/components/admin/ui";

type LinkItem = { href: string; title: string; body: string };

export function PromiseEditor({ initial }: { initial: LinkItem[] }) {
  const [links, setLinks] = useState(initial);

  return (
    <>
      <input type="hidden" name="content" value={JSON.stringify(links)} />
      {links.map((link, index) => (
        <fieldset
          key={link.href}
          className="rounded-lg border border-outline-variant/20 bg-surface-container-low p-4"
        >
          <legend className="px-1 text-sm font-bold text-primary">{link.title}</legend>
          <p className="text-xs text-on-surface-variant">Route: {link.href}</p>
          <label className="mt-3 block text-xs font-semibold">
            Summary
            <textarea
              rows={2}
              value={link.body}
              onChange={(e) => {
                const next = links.slice();
                next[index] = { ...link, body: e.target.value };
                setLinks(next);
              }}
              className={`${fieldClassName()} bg-white`}
            />
          </label>
        </fieldset>
      ))}
    </>
  );
}
