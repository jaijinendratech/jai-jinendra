import type { Metadata } from "next";
import Image from "next/image";
import { loginAdminWithPasswordAction } from "@/lib/auth";
import { ADMIN_EMAIL } from "@/lib/admin-config";
import { siteConfig } from "@/data/home";
import { safeAdminRedirectPath } from "@/lib/safe-redirect";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const hasError = params.error === "1" || params.error === "unauthorized";
  const next = safeAdminRedirectPath(params.next, "/admin");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f4f2] px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-outline-variant/30 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image
            src={siteConfig.logo.src}
            alt={siteConfig.logo.alt}
            width={siteConfig.logo.width}
            height={siteConfig.logo.height}
            className="h-12 w-auto object-contain"
            priority
          />
          <h1 className="mt-4 text-xl font-bold text-on-surface">Admin sign in</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Supabase Auth — admin role required.
          </p>
        </div>

        {hasError ? (
          <p className="mb-4 rounded-lg border border-error/30 bg-error-container/40 px-3 py-2 text-sm text-error">
            {params.error === "unauthorized"
              ? "This account does not have admin access."
              : "Invalid email or password."}
          </p>
        ) : null}

        <form action={loginAdminWithPasswordAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <label className="block text-sm font-semibold text-on-surface">
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={ADMIN_EMAIL}
              className="mt-1.5 w-full rounded-lg border border-outline-variant/50 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </label>
          <label className="block text-sm font-semibold text-on-surface">
            Password
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1.5 w-full rounded-lg border border-outline-variant/50 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-container"
          >
            Sign in
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-on-surface-variant">
          With Supabase configured, run{" "}
          <code className="rounded bg-surface-container-high px-1">npm run create-admin</code>{" "}
          once to provision this account.
        </p>
      </div>
    </main>
  );
}
