import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { safeRedirectPath } from "@/lib/safe-redirect";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string;
    error?: string;
    mode?: string;
    notice?: string;
  }>;
}) {
  const params = await searchParams;
  const next = safeRedirectPath(params.next, "/account");
  const mode = params.mode === "signup" ? "signup" : "signin";

  return (
    <main className="container-jj flex min-h-[70vh] items-center justify-center py-12">
      <LoginForm
        mode={mode}
        next={next}
        error={params.error}
        notice={params.notice}
      />
    </main>
  );
}
