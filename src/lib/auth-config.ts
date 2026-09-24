/** Shared auth env helpers (safe to import from server components). */

export function getFixedOtp(): string | undefined {
  const value = process.env.AUTH_FIXED_OTP?.trim();
  return value || undefined;
}

export function isFixedOtpEnabled(): boolean {
  return Boolean(getFixedOtp());
}
