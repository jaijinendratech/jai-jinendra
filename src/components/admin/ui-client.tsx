"use client";

import type { ReactNode } from "react";
import { useRef, useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import {
  fieldClassName,
  labelClassName,
  secondaryBtnClassName,
} from "@/components/admin/styles";

export function ConfirmDeleteButton({
  action,
  label = "Delete",
  children,
  confirmMessage = "Delete this item permanently?",
  className,
}: {
  action: (formData: FormData) => void | Promise<void>;
  label?: string;
  children?: ReactNode;
  confirmMessage?: string;
  className?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const allowSubmitRef = useRef(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <form
        ref={formRef}
        action={action}
        onSubmit={(e) => {
          if (!allowSubmitRef.current) {
            e.preventDefault();
            setConfirmOpen(true);
            return;
          }
          allowSubmitRef.current = false;
        }}
        className="inline"
      >
        {children}
        <button
          type="submit"
          className={cn(
            "text-sm font-semibold text-red-700 hover:underline",
            className,
          )}
        >
          {label}
        </button>
      </form>

      <AdminConfirmDialog
        isOpen={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmMessage}
        message="This action cannot be undone."
        confirmLabel={label}
        danger
        onConfirm={() => {
          allowSubmitRef.current = true;
          formRef.current?.requestSubmit();
        }}
      />
    </>
  );
}

export function ImageUploadField({
  name = "storagePath",
  defaultValue = "",
  folder = "uploads",
  label = "Image",
}: {
  name?: string;
  defaultValue?: string;
  folder?: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [path, setPath] = useState(defaultValue);
  const [preview, setPreview] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setError(null);
    startTransition(async () => {
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
        return;
      }
      const next = json.url ?? json.path ?? "";
      setPath(next);
      setPreview(next);
    });
  }

  return (
    <div>
      <p className={labelClassName()}>{label}</p>
      <input type="hidden" name={name} value={path} />
      <div
        className={cn(
          "mt-1.5 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-outline-variant/50 bg-surface-container-low px-4 py-6 text-center",
          pending && "opacity-60",
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFiles(e.dataTransfer.files);
        }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            className="h-28 w-auto max-w-full rounded-md object-cover"
          />
        ) : (
          <p className="text-xs text-on-surface-variant">
            Drag & drop an image, or choose a file
          </p>
        )}
        <button
          type="button"
          className={secondaryBtnClassName()}
          onClick={() => inputRef.current?.click()}
          disabled={pending}
        >
          {pending ? "Uploading…" : "Choose file"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
        <label className="w-full text-left text-xs font-semibold text-on-surface-variant">
          Or paste path / URL
          <input
            value={path}
            onChange={(e) => {
              setPath(e.target.value);
              setPreview(e.target.value);
            }}
            className={fieldClassName()}
            placeholder="/images/prod0.jpg"
          />
        </label>
        {error ? <p className="text-xs text-red-700">{error}</p> : null}
      </div>
    </div>
  );
}
