import type { Metadata } from "next";
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
          <input
            name="fullName"
            defaultValue={profile?.full_name ?? ""}
            className="mt-1.5 w-full rounded-lg border border-outline-variant/40 bg-white px-3 py-2 text-sm font-normal"
            disabled={!supabase}
          />
        </label>
        <label className="block text-sm font-semibold">
          Email
          <input
            name="email"
            type="email"
            defaultValue={profile?.email ?? user.email ?? ""}
            className="mt-1.5 w-full rounded-lg border border-outline-variant/40 bg-white px-3 py-2 text-sm font-normal"
            disabled={!supabase}
          />
        </label>
        <label className="block text-sm font-semibold">
          Phone
          <input
            name="phone"
            defaultValue={profile?.phone ?? user.phone ?? ""}
            className="mt-1.5 w-full rounded-lg border border-outline-variant/40 bg-white px-3 py-2 text-sm font-normal"
            disabled={!supabase}
          />
        </label>
        {supabase ? (
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Save profile
          </button>
        ) : (
          <p className="text-sm text-on-surface-variant">
            Connect Supabase to edit your profile.
          </p>
        )}
      </form>
    </div>
  );
}
