import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { getFixedOtp } from "@/lib/auth-config";
import { safeRedirectPath } from "@/lib/safe-redirect";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    step?: string;
    phone?: string;
    next?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;
  const step = params.step === "verify" ? "verify" : "phone";
  const phone = params.phone ?? "";
  const next = safeRedirectPath(params.next, "/account");
  const error = params.error;
  const fixedOtp = getFixedOtp();

  return (
    <main className="container-jj flex min-h-[70vh] items-center justify-center py-12">
      <LoginForm
        step={step}
        phone={phone}
        next={next}
        error={error}
        fixedOtp={fixedOtp}
      />
    </main>
  );
}
