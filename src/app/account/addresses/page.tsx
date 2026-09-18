import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import {
  deleteAccountAddressAction,
  saveAccountAddressAction,
  setDefaultAccountAddressAction,
} from "@/lib/account/actions";

export const metadata: Metadata = {
  title: "Addresses",
  robots: { index: false, follow: false },
};

type AddressRow = {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
};

export default async function AccountAddressesPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { notice, error } = await searchParams;
  const user = await requireUser("/login?next=/account/addresses");
  const supabaseReady = isSupabaseConfigured();

  let addresses: AddressRow[] = [];
  if (supabaseReady) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    addresses = (data as AddressRow[] | null) ?? [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-on-surface">
          Addresses
        </h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Saved delivery addresses for checkout.
        </p>
      </div>

      {notice ? (
        <p className="rounded-lg border border-secondary/30 bg-secondary-container/30 px-4 py-3 text-sm">
          {notice === "saved"
            ? "Address saved."
            : notice === "deleted"
              ? "Address removed."
              : notice === "default-set"
                ? "Default address updated."
                : "Done."}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error === "missing-fields"
            ? "Please fill in all required fields."
            : "Could not save address. Please try again."}
        </p>
      ) : null}

      <ul className="space-y-3">
        {addresses.map((addr) => (
          <li
            key={addr.id}
            className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {addr.name}
                  {addr.is_default ? (
                    <span className="ml-2 text-xs font-bold uppercase tracking-wide text-primary">
                      Default
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {addr.phone}
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {[addr.line1, addr.line2].filter(Boolean).join(", ")}
                  <br />
                  {[addr.city, addr.state, addr.pincode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {!addr.is_default ? (
                  <form action={setDefaultAccountAddressAction}>
                    <input type="hidden" name="id" value={addr.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-outline-variant/40 px-3 py-1.5 text-xs font-semibold hover:border-primary hover:text-primary"
                    >
                      Set default
                    </button>
                  </form>
                ) : null}
                <form action={deleteAccountAddressAction}>
                  <input type="hidden" name="id" value={addr.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </form>
              </div>
            </div>
          </li>
        ))}
        {!addresses.length ? (
          <li className="rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low p-6 text-sm text-on-surface-variant">
            No saved addresses yet. Add one below.
          </li>
        ) : null}
      </ul>

      <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6">
        <h3 className="text-lg font-semibold">Add address</h3>
        <form
          action={saveAccountAddressAction}
          className="mt-4 grid gap-3 sm:grid-cols-2"
        >
          <label className="block text-sm font-semibold sm:col-span-2">
            Full name
            <input
              name="name"
              required
              className="mt-1.5 w-full rounded-lg border border-outline-variant/40 bg-white px-3 py-2 text-sm font-normal"
              disabled={!supabaseReady}
            />
          </label>
          <label className="block text-sm font-semibold">
            Phone
            <input
              name="phone"
              required
              className="mt-1.5 w-full rounded-lg border border-outline-variant/40 bg-white px-3 py-2 text-sm font-normal"
              disabled={!supabaseReady}
            />
          </label>
          <label className="block text-sm font-semibold">
            Pincode
            <input
              name="pincode"
              required
              className="mt-1.5 w-full rounded-lg border border-outline-variant/40 bg-white px-3 py-2 text-sm font-normal"
              disabled={!supabaseReady}
            />
          </label>
          <label className="block text-sm font-semibold sm:col-span-2">
            Address line 1
            <input
              name="line1"
              required
              className="mt-1.5 w-full rounded-lg border border-outline-variant/40 bg-white px-3 py-2 text-sm font-normal"
              disabled={!supabaseReady}
            />
          </label>
          <label className="block text-sm font-semibold sm:col-span-2">
            Address line 2
            <input
              name="line2"
              className="mt-1.5 w-full rounded-lg border border-outline-variant/40 bg-white px-3 py-2 text-sm font-normal"
              disabled={!supabaseReady}
            />
          </label>
          <label className="block text-sm font-semibold">
            City
            <input
              name="city"
              required
              className="mt-1.5 w-full rounded-lg border border-outline-variant/40 bg-white px-3 py-2 text-sm font-normal"
              disabled={!supabaseReady}
            />
          </label>
          <label className="block text-sm font-semibold">
            State
            <input
              name="state"
              required
              className="mt-1.5 w-full rounded-lg border border-outline-variant/40 bg-white px-3 py-2 text-sm font-normal"
              disabled={!supabaseReady}
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
            <input
              type="checkbox"
              name="isDefault"
              defaultChecked={!addresses.length}
              disabled={!supabaseReady}
            />
            Set as default
          </label>
          {supabaseReady ? (
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 sm:col-span-2 sm:w-fit"
            >
              Save address
            </button>
          ) : (
            <p className="text-sm text-on-surface-variant sm:col-span-2">
              Connect Supabase to manage addresses.
            </p>
          )}
        </form>
      </section>
    </div>
  );
}
