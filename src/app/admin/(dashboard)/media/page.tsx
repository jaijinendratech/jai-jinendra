import type { Metadata } from "next";
import Image from "next/image";
import { getAdminMedia, getIntegrationStatus } from "@/lib/admin/queries";
import { deleteMediaAssetAction } from "@/lib/admin/actions";
import { AdminPageHeader } from "@/components/admin/ui";
import { ConfirmDeleteButton } from "@/components/admin/ui-client";
import { MediaUploadPanel } from "./MediaUploadPanel";

export const metadata: Metadata = {
  title: "Admin · Media",
  robots: { index: false, follow: false },
};

export default async function AdminMediaPage() {
  const assets = await getAdminMedia();
  const { supabase, storage } = getIntegrationStatus();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Media library"
        description={
          storage
            ? "Assets from media_assets + Supabase Storage bucket `media`."
            : "Public folder inventory (upload requires Supabase Storage)."
        }
      />

      <MediaUploadPanel enabled={Boolean(supabase && storage)} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {assets.map((asset) => (
          <article
            key={asset.id}
            className="overflow-hidden rounded-xl border border-outline-variant/25 bg-white shadow-sm"
          >
            <div className="relative aspect-video bg-surface-container">
              <Image
                src={asset.publicUrl}
                alt={asset.alt ?? ""}
                fill
                sizes="300px"
                className="object-cover"
              />
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-semibold text-on-surface">
                {asset.alt || asset.storagePath}
              </p>
              <p className="mt-0.5 text-[11px] uppercase tracking-wide text-on-surface-variant">
                {asset.folder || "general"}
              </p>
              <p className="mt-1 truncate text-xs text-outline">{asset.storagePath}</p>
              {supabase && !asset.storagePath.startsWith("/") ? (
                <div className="mt-2">
                  <ConfirmDeleteButton action={deleteMediaAssetAction} label="Remove">
                    <input type="hidden" name="id" value={asset.id} />
                  </ConfirmDeleteButton>
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
