import type { Metadata } from "next";
import Image from "next/image";
import { getAdminMedia, getIntegrationStatus } from "@/lib/admin/queries";
import { AdminPageHeader } from "@/components/admin/ui";
import { MediaCardActions } from "@/components/admin/MediaCardActions";
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
        description="Photos and assets that dress the storefront."
      />

      <MediaUploadPanel enabled={Boolean(supabase && storage)} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {assets.map((asset) => (
          <article
            key={asset.id}
            className="relative overflow-hidden rounded-xl border border-outline-variant/25 bg-white shadow-sm"
          >
            {supabase && !asset.storagePath.startsWith("/") ? (
              <div className="absolute right-2 top-2 z-10 rounded-lg bg-white/95 shadow-sm backdrop-blur">
                <MediaCardActions id={asset.id} />
              </div>
            ) : null}
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
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
