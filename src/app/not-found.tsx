import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="container-jj flex flex-1 flex-col items-center justify-center py-24 text-center">
      <p className="label-sm uppercase tracking-widest text-primary">404</p>
      <h1 className="font-display mt-2 text-4xl font-semibold text-on-surface">
        This shelf is empty
      </h1>
      <p className="mt-3 max-w-md text-sm text-on-surface-variant">
        The page you are looking for is not available. Return home to explore our namkeens, mithai,
        and festive hampers.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary"
      >
        Back to Home
      </Link>
    </main>
  );
}
