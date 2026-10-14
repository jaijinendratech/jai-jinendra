import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; done?: string }>;
}) {
  const { token, done } = await searchParams;
  const validToken = token && UUID.test(token) ? token : null;

  return (
    <main className="container-jj flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-8 text-center shadow-sm">
        {done ? (
          <>
            <h1 className="font-display text-2xl font-semibold text-on-surface">
              You&apos;re unsubscribed
            </h1>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              You won&apos;t receive offers or announcements from Jai Jinendra
              Namkeens any more. Order updates for purchases you make will still
              reach you.
            </p>
          </>
        ) : validToken ? (
          <>
            <h1 className="font-display text-2xl font-semibold text-on-surface">
              Unsubscribe from our emails?
            </h1>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              You will stop receiving offers and announcements. You can sign up
              again any time.
            </p>
            <form
              method="post"
              action={`/api/unsubscribe?token=${encodeURIComponent(validToken)}`}
              className="mt-6"
            >
              <button
                type="submit"
                className="w-full rounded-lg bg-primary-container py-3 text-sm font-bold text-white hover:bg-primary"
              >
                Yes, unsubscribe me
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-semibold text-on-surface">
              This link isn&apos;t valid
            </h1>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              Please use the unsubscribe link from the most recent email we sent
              you.
            </p>
          </>
        )}
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-semibold text-primary hover:underline"
        >
          Back to the store
        </Link>
      </div>
    </main>
  );
}
