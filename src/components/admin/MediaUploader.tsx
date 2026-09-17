"use client";

import { useRef, useState, useTransition } from "react";
import {
  LuImagePlus,
  LuTrash2,
  LuStar,
  LuGripVertical,
  LuChevronDown,
} from "react-icons/lu";
import { cn } from "@/lib/cn";
import { fieldClassName, labelClassName, secondaryBtnClassName } from "@/components/admin/ui";

export type MediaItem = {
  id?: string;
  path: string;
  url: string;
  alt?: string;
  sortOrder?: number;
};

export function MediaUploader({
  name = "storagePath",
  label = "Images",
  folder = "uploads",
  multiple = false,
  defaultItems = [],
  onChange,
  disabled,
  disabledReason,
}: {
  name?: string;
  label?: string;
  folder?: string;
  multiple?: boolean;
  defaultItems?: MediaItem[];
  onChange?: (items: MediaItem[]) => void;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaItem[]>(defaultItems);
  const [error, setError] = useState<string | null>(null);
  const [showPath, setShowPath] = useState(false);
  const [pathDraft, setPathDraft] = useState("");
  const [pending, startTransition] = useTransition();

  function setAll(next: MediaItem[]) {
    setItems(next);
    onChange?.(next);
  }

  function uploadFiles(files: FileList | null) {
    if (!files?.length || disabled) return;
    setError(null);
    const list = Array.from(files);
    startTransition(async () => {
      const uploaded: MediaItem[] = [];
      for (const file of list) {
        const body = new FormData();
        body.append("file", file);
        body.append("folder", folder);
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const json = (await res.json()) as {
          path?: string;
          url?: string;
          error?: string;
        };
        if (!res.ok) {
          setError(json.error ?? "Upload failed");
          continue;
        }
        uploaded.push({
          path: json.path ?? "",
          url: json.url ?? json.path ?? "",
          alt: file.name,
        });
      }
      if (!uploaded.length) return;
      setAll(multiple ? [...items, ...uploaded] : [uploaded[0]]);
    });
  }

  const primaryPath = items[0]?.url || items[0]?.path || "";

  return (
    <div>
      <p className={labelClassName()}>{label}</p>
      {!multiple ? <input type="hidden" name={name} value={primaryPath} /> : null}
      {multiple
        ? items.map((item, i) => (
            <input
              key={`${item.path}-${i}`}
              type="hidden"
              name={`${name}[]`}
              value={item.url || item.path}
            />
          ))
        : null}

      {disabled ? (
        <p className="mt-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {disabledReason ?? "Uploads require Supabase Storage."}
        </p>
      ) : (
        <div
          className={cn(
            "mt-1.5 rounded-lg border border-dashed border-outline-variant/50 bg-surface-container-low px-4 py-6 text-center",
            pending && "opacity-60",
          )}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            uploadFiles(e.dataTransfer.files);
          }}
        >
          <LuImagePlus className="mx-auto h-8 w-8 text-primary" aria-hidden />
          <p className="mt-2 text-sm font-semibold text-on-surface">
            Drag & drop images here
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">
            PNG, JPG, WebP — optimized automatically on upload
          </p>
          <button
            type="button"
            className={`${secondaryBtnClassName()} mt-3`}
            onClick={() => inputRef.current?.click()}
            disabled={pending}
          >
            {pending ? "Uploading…" : "Choose from PC"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            className="hidden"
            onChange={(e) => uploadFiles(e.target.files)}
          />
        </div>
      )}

      {items.length ? (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {items.map((item, index) => (
            <li
              key={`${item.path}-${index}`}
              className="flex items-center gap-2 rounded-lg border border-outline-variant/25 bg-white p-2"
            >
              <LuGripVertical className="h-4 w-4 shrink-0 text-outline" aria-hidden />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url || item.path}
                alt={item.alt ?? ""}
                className="h-14 w-14 rounded-md object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{item.alt || "Image"}</p>
                {index === 0 ? (
                  <p className="text-[10px] font-semibold text-primary">Primary</p>
                ) : null}
              </div>
              <button
                type="button"
                className="rounded-md p-1.5 text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
                aria-label="Set as primary"
                onClick={() => {
                  const next = [...items];
                  const [picked] = next.splice(index, 1);
                  next.unshift(picked);
                  setAll(next);
                }}
              >
                <LuStar className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded-md p-1.5 text-red-700 hover:bg-red-50"
                aria-label="Remove"
                onClick={() => setAll(items.filter((_, i) => i !== index))}
              >
                <LuTrash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <button
        type="button"
        className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-on-surface-variant hover:text-primary"
        onClick={() => setShowPath((v) => !v)}
      >
        <LuChevronDown className={cn("h-3 w-3 transition", showPath && "rotate-180")} />
        Advanced: paste path / URL
      </button>
      {showPath ? (
        <div className="mt-2 flex gap-2">
          <input
            value={pathDraft}
            onChange={(e) => setPathDraft(e.target.value)}
            placeholder="/images/prod0.jpg"
            className={`${fieldClassName()} mt-0! flex-1`}
          />
          <button
            type="button"
            className={secondaryBtnClassName()}
            onClick={() => {
              if (!pathDraft.trim()) return;
              const item = { path: pathDraft.trim(), url: pathDraft.trim() };
              setAll(multiple ? [...items, item] : [item]);
              setPathDraft("");
            }}
          >
            Add
          </button>
        </div>
      ) : null}

      {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
