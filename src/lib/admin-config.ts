/** Admin session cookie used when Supabase is not configured (local dev fallback). */
export const ADMIN_SESSION_COOKIE = "jj_admin_session";

export const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL ?? "admin@jaijinendranamkeens.com";

/**
 * Require ADMIN_PASSWORD from env — no hardcoded fallback.
 * Throws if unset so local demo and create-admin fail closed.
 */
export function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password) {
    throw new Error(
      "ADMIN_PASSWORD environment variable is required (no default password)",
    );
  }
  return password;
}

export function verifyAdminCredentials(
  email: string,
  password: string,
): boolean {
  try {
    return (
      email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
      password === getAdminPassword()
    );
  } catch {
    return false;
  }
}
