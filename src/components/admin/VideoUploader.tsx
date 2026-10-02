"use client";

import { useRef, useState } from "react";
import { LuTrash2, LuVideo } from "react-icons/lu";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";
import { MediaUploader, type MediaItem } from "@/components/admin/MediaUploader";
import {
  labelClassName,
  secondaryBtnClassName,
} from "@/components/admin/ui";

export type VideoAsset = {
  path: string;
  url: string;
  posterPath?: string;
  posterUrl?: string;
};

const ALLOWED_TYPES = new Set(["video/mp4", "video/webm"]);
const MAX_BYTES = 50 * 1024 * 1024;

export function VideoUploader({
  name = "videoUrl",
  posterName = "posterUrl",
  label = "Video",
  folder = "videos",
  posterFolder = "video-posters",
  includePoster = false,
  defaultValue,
  onChange,
  disabled,
  disabledReason,
}: {
  name?: string;
  posterName?: string;
  label?: string;
  folder?: string;
  posterFolder?: string;
  includePoster?: boolean;
  defaultValue?: VideoAsset | null;
  onChange?: (asset: VideoAsset | null) => void;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [asset, setAsset] = useState<VideoAsset | null>(defaultValue ?? null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [pending, setPending] = useState(false);

  function setNext(next: VideoAsset | null) {
    setAsset(next);
    onChange?.(next);
  }

  async function uploadFile(file: File | undefined) {
    if (!file || disabled) return;
    setError(null);

    if (!ALLOWED_TYPES.has(file.type)) {
      setError("Only MP4 and WebM videos are allowed");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Video must be 50MB or smaller");
      return;
    }

    setPending(true);
    setProgress(10);
    try {
      const res = await fetch("/api/admin/upload/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder,
          fileName: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });
      const json = (await res.json()) as {
        path?: string;
        token?: string;
        signedUrl?: string;
        publicUrl?: string;
        error?: string;
      };
      if (!res.ok || !json.path || !json.token) {
        setError(json.error ?? "Could not start video upload");
        return;
      }

      setProgress(35);
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("media")
        .uploadToSignedUrl(json.path, json.token, file, {
          contentType: file.type,
        });

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        return;
      }

      setProgress(100);
      setNext({
        path: json.path,
        url: json.publicUrl ?? json.path,
        posterPath: asset?.posterPath,
        posterUrl: asset?.posterUrl,
      });
    } catch {
      setError("Upload failed. Try another file.");
    } finally {
      setPending(false);
      setProgress(null);
    }
  }

  function onPosterChange(items: MediaItem[]) {
    const poster = items[0];
    const next: VideoAsset = {
      path: asset?.path ?? "",
      url: asset?.url ?? "",
      posterPath: poster?.path,
      posterUrl: poster?.url,
    };
    setNext(next.path || next.url || next.posterUrl ? next : null);
  }

  return (
    <div>
      <p className={labelClassName()}>{label}</p>
      <input type="hidden" name={name} value={asset?.url ?? ""} />
      {includePoster ? (
        <input type="hidden" name={posterName} value={asset?.posterUrl ?? ""} />
      ) : null}

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
            void uploadFile(e.dataTransfer.files[0]);
          }}
        >
          <LuVideo className="mx-auto h-8 w-8 text-primary" aria-hidden />
          <p className="mt-2 text-sm font-semibold text-on-surface">
            Drag & drop a video here
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">
            MP4 or WebM — uploaded directly to storage (max 50MB)
          </p>
          <button
            type="button"
            className={`${secondaryBtnClassName()} mt-3`}
            onClick={() => inputRef.current?.click()}
            disabled={pending}
          >
            {pending ? "Uploading…" : "Choose video"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/webm"
            className="hidden"
            onChange={(e) => {
              void uploadFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {progress != null ? (
            <div
              className="mx-auto mt-4 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              aria-label="Video upload progress"
            >
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          ) : null}
        </div>
      )}

      {asset?.url ? (
        <div className="mt-3 flex items-start gap-3 rounded-lg border border-outline-variant/25 bg-white p-2">
          <video
            src={asset.url}
            poster={asset.posterUrl}
            controls
            preload="metadata"
            className="h-24 w-40 shrink-0 rounded-md bg-black object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">Video ready</p>
            <p className="mt-0.5 truncate text-[11px] text-outline">{asset.path}</p>
          </div>
          <button
            type="button"
            className="rounded-md p-1.5 text-red-700 hover:bg-red-50"
            aria-label="Remove video"
            onClick={() =>
              setNext(
                asset.posterUrl
                  ? { path: "", url: "", posterPath: asset.posterPath, posterUrl: asset.posterUrl }
                  : null,
              )
            }
          >
            <LuTrash2 className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {includePoster ? (
        <div className="mt-4">
          <MediaUploader
            name={`${posterName}-files`}
            label="Poster image"
            folder={posterFolder}
            defaultItems={
              asset?.posterUrl
                ? [{ path: asset.posterPath ?? asset.posterUrl, url: asset.posterUrl }]
                : []
            }
            onChange={onPosterChange}
            disabled={disabled}
            disabledReason={disabledReason}
          />
        </div>
      ) : null}

      {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
