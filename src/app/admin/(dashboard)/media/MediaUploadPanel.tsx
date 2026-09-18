"use client";

import { useRouter } from "next/navigation";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { AdminIconButton } from "@/components/admin/AdminIconButton";

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
      <AdminIconButton
        label="Refresh library"
        icon="refresh"
        variant="secondary"
        showLabel
        onClick={() => router.refresh()}
      />
    </div>
  );
}
