import type { Metadata } from "next";
import { Mail, Phone, User } from "lucide-react";
import { AccountSubmitButton } from "@/components/account/AccountSubmitButton";
import { getProfile, requireUser } from "@/lib/auth";
import { updateAccountProfileAction } from "@/lib/account/actions";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
};

export default async function AccountProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { notice, error } = await searchParams;
  const user = await requireUser("/login?next=/account/profile");
  const profile = await getProfile(user.id);
  const supabase = isSupabaseConfigured();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-semibold text-on-surface">
          Profile
        </h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Update the details we use for orders and delivery.
        </p>
      </div>

      {notice === "saved" ? (
        <p className="rounded-lg border border-secondary/30 bg-secondary-container/30 px-4 py-3 text-sm">
          Profile saved.
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not save profile. Please try again.
        </p>
      ) : null}

      <form
        action={updateAccountProfileAction}
        className="max-w-lg space-y-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6"
      >
        <label className="block text-sm font-semibold">
          Full name
          <span className="relative mt-1.5 block">
            <User
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant"
              aria-hidden
            />
            <input
              name="fullName"
              defaultValue={profile?.full_name ?? ""}
              className="w-full rounded-lg border border-outline-variant/40 bg-white py-2 pl-10 pr-3 text-sm font-normal"
              disabled={!supabase}
            />
          </span>
        </label>
        <label className="block text-sm font-semibold">
          Email
          <span className="relative mt-1.5 block">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant"
              aria-hidden
            />
            <input
              name="email"
              type="email"
              defaultValue={profile?.email ?? user.email ?? ""}
              className="w-full rounded-lg border border-outline-variant/40 bg-white py-2 pl-10 pr-3 text-sm font-normal"
              disabled={!supabase}
            />
          </span>
        </label>
        <label className="block text-sm font-semibold">
          Phone
          <span className="relative mt-1.5 block">
            <Phone
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant"
              aria-hidden
            />
            <input
              name="phone"
              defaultValue={profile?.phone ?? user.phone ?? ""}
              className="w-full rounded-lg border border-outline-variant/40 bg-white py-2 pl-10 pr-3 text-sm font-normal"
              disabled={!supabase}
            />
          </span>
        </label>
        {supabase ? (
          <AccountSubmitButton
            pendingLabel="Saving…"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Save profile
          </AccountSubmitButton>
        ) : (
          <p className="text-sm text-on-surface-variant">
            Connect Supabase to edit your profile.
          </p>
        )}
      </form>
    </div>
  );
}
