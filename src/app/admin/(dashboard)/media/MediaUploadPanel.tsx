"use client";

import { useRouter } from "next/navigation";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { secondaryBtnClassName } from "@/components/admin/ui";

export function MediaUploadPanel({ enabled }: { enabled: boolean }) {
  const router = useRouter();

  return (
    <div className="space-y-3 rounded-xl border border-outline-variant/25 bg-white p-4 shadow-sm">
      <MediaUploader
        folder="library"
        label="Media library upload"
        multiple
        disabled={!enabled}
        disabledReason='Configure Supabase and create a public Storage bucket named "media".'
        onChange={() => router.refresh()}
      />
      <button
        type="button"
        className={secondaryBtnClassName()}
        onClick={() => router.refresh()}
      >
        Refresh library
      </button>
    </div>
  );
}
