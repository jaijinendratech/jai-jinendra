import type { Metadata } from "next";
import Link from "next/link";
import { sendPhoneOtpAction, verifyPhoneOtpAction } from "@/lib/auth";
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

  return (
    <main className="container-jj flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-8 shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-on-surface">
          {step === "verify" ? "Enter OTP" : "Sign in with phone"}
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Account required before checkout. We&apos;ll send a one-time code via
          SMS.
        </p>

        {error === "invalid_phone" ? (
          <p className="mt-4 rounded-lg border border-error/30 bg-error-container/40 px-3 py-2 text-sm text-error">
            Enter a valid 10-digit mobile number.
          </p>
        ) : null}
        {error === "otp_failed" || error === "invalid_otp" ? (
          <p className="mt-4 rounded-lg border border-error/30 bg-error-container/40 px-3 py-2 text-sm text-error">
            OTP verification failed. Please try again.
          </p>
        ) : null}

        {step === "phone" ? (
          <form action={sendPhoneOtpAction} className="mt-6 space-y-4">
            <input type="hidden" name="next" value={next} />
            <label className="block text-sm font-semibold text-on-surface">
              Mobile number
              <input
                name="phone"
                type="tel"
                required
                placeholder="9876543210"
                className="mt-1.5 w-full rounded-lg border border-outline-variant/50 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-container"
            >
              Send OTP
            </button>
          </form>
        ) : (
          <form action={verifyPhoneOtpAction} className="mt-6 space-y-4">
            <input type="hidden" name="phone" value={phone} />
            <input type="hidden" name="next" value={next} />
            <p className="text-sm text-on-surface-variant">
              Code sent to <span className="font-semibold">{phone}</span>
            </p>
            <label className="block text-sm font-semibold text-on-surface">
              6-digit OTP
              <input
                name="token"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                className="mt-1.5 w-full rounded-lg border border-outline-variant/50 px-3 py-2.5 text-sm tracking-widest focus:border-primary focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-container"
            >
              Verify & continue
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-on-surface-variant">
          <Link href="/catalogue" className="text-primary hover:underline">
            Continue browsing
          </Link>
        </p>
      </div>
    </main>
  );
}
