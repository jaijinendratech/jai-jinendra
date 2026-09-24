/** Domain used for OTP phone-login auth users without a real email. */
export const SYNTHETIC_PHONE_EMAIL_DOMAIN = "phone.customers.local";

/** True when email is the placeholder created for phone-OTP customers. */
export function isSyntheticPhoneEmail(
  email: string | null | undefined,
): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return normalized.endsWith(`@${SYNTHETIC_PHONE_EMAIL_DOMAIN}`);
}
