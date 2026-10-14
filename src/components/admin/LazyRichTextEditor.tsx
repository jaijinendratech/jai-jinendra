"use client";

import { lazy, Suspense, type ComponentProps } from "react";
import { labelClassName } from "@/components/admin/ui";
import type { RichTextEditor as RichTextEditorType } from "@/components/admin/RichTextEditor";

const RichTextEditor = lazy(() =>
  import("@/components/admin/RichTextEditor").then((m) => ({
    default: m.RichTextEditor,
  })),
);

type Props = ComponentProps<typeof RichTextEditorType>;

/**
 * Tiptap is a large chunk; load it on demand. The fallback keeps the hidden
 * input so a form submitted before the editor loads still sends the value.
 */
export function LazyRichTextEditor(props: Props) {
  return (
    <Suspense
      fallback={
        <div>
          <p className={labelClassName()}>{props.label}</p>
          <input type="hidden" name={props.name} value={props.defaultValue ?? ""} />
          <div
            className="mt-1.5 h-40 animate-pulse rounded-lg border border-outline-variant/50 bg-surface-container-low"
            aria-hidden
          />
        </div>
      }
    >
      <RichTextEditor {...props} />
    </Suspense>
  );
}
