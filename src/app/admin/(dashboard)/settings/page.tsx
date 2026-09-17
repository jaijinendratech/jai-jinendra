import type { Metadata } from "next";
import { siteConfig } from "@/data/home";
import { getIntegrationStatus } from "@/lib/admin/queries";
import { isSupabaseConfigured } from "@/lib/env";
import {
  AdminCard,
  AdminPageHeader,
  fieldClassName,
  labelClassName,
} from "@/components/admin/ui";

export const metadata: Metadata = {
  title: "Admin · Settings",
  robots: { index: false, follow: false },
};

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
        ok ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-600"
      }`}
    >
      {label}: {ok ? "Configured" : "Not set"}
    </span>
  );
}

export default function AdminSettingsPage() {
  const integrations = getIntegrationStatus();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Settings"
        description="Store identity and integration status (secrets never shown)."
      />

      <AdminCard title="Integrations">
        <div className="flex flex-wrap gap-2">
          <StatusPill ok={integrations.supabase} label="Supabase" />
          <StatusPill ok={integrations.razorpay} label="Razorpay" />
          <StatusPill ok={integrations.shiprocket} label="Shiprocket" />
          <StatusPill ok={integrations.resend} label="Resend" />
          <StatusPill ok={integrations.storage} label="Storage" />
        </div>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-on-surface-variant">
          <li>Razorpay: checks presence of RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET only.</li>
          <li>
            Shiprocket: checks SHIPROCKET_EMAIL + SHIPROCKET_PASSWORD presence only — API
            integration deferred; use order shipping fields manually.
          </li>
          <li>Supabase currently: {isSupabaseConfigured() ? "on" : "off"}.</li>
        </ul>
      </AdminCard>

      <AdminCard title="Store identity (read-only from site config)">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClassName()}>
            Store name
            <input readOnly value={siteConfig.name} className={fieldClassName()} />
          </label>
          <label className={labelClassName()}>
            Tagline
            <input readOnly value={siteConfig.tagline} className={fieldClassName()} />
          </label>
          <label className={labelClassName()}>
            Email
            <input readOnly value={siteConfig.email} className={fieldClassName()} />
          </label>
          <label className={labelClassName()}>
            Phone
            <input readOnly value={siteConfig.phone} className={fieldClassName()} />
          </label>
          <label className={`${labelClassName()} sm:col-span-2`}>
            FSSAI
            <input readOnly value={siteConfig.fssai} className={fieldClassName()} />
          </label>
          <label className={`${labelClassName()} sm:col-span-2`}>
            Instagram
            <input
              readOnly
              value={siteConfig.social.instagram}
              className={fieldClassName()}
            />
          </label>
        </div>
        <p className="mt-3 text-xs text-on-surface-variant">
          Persist store identity via content_blocks / env when you wire a dedicated settings
          save action. Values above mirror the storefront config.
        </p>
      </AdminCard>

      <AdminCard title="Shipping">
        <p className="text-sm text-on-surface-variant">
          Free shipping threshold and zone rules live in code / shipping_zones. Shiprocket
          order creation is intentionally deferred — order detail supports manual courier,
          AWB, shipment ID, and tracking URL fields.
        </p>
      </AdminCard>
    </div>
  );
}
