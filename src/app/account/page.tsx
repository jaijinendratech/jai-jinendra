import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { getProfile, getSessionUser, signOutAction } from "@/lib/auth";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await getSessionUser();
  const profile = user ? await getProfile(user.id) : null;

  return (
    <main className="container-jj py-6 md:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Account" }]} />

      <h1 className="font-display mt-4 text-3xl font-semibold text-on-surface">
        My Account
      </h1>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6">
          <h2 className="text-lg font-semibold">Profile</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-on-surface-variant">Phone</dt>
              <dd className="font-semibold">{profile?.phone ?? user?.phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-on-surface-variant">Email</dt>
              <dd className="font-semibold">{profile?.email ?? user?.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-on-surface-variant">Name</dt>
              <dd className="font-semibold">{profile?.full_name ?? "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6">
          <h2 className="text-lg font-semibold">Orders & support</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link href="/account/orders" className="font-semibold text-primary hover:underline">
                Order history
              </Link>
            </li>
            <li>
              <Link href="/track-order" className="font-semibold text-primary hover:underline">
                Track an order
              </Link>
            </li>
          </ul>
          <form action={signOutAction} className="mt-6">
            <button
              type="submit"
              className="rounded-lg border border-outline-variant/40 px-4 py-2 text-sm font-semibold hover:bg-surface-container-low"
            >
              Sign out
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
