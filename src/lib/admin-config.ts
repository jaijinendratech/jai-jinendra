/** Admin session cookie used when Supabase is not configured (local dev fallback). */
export const ADMIN_SESSION_COOKIE = "jj_admin_session";

export const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL ?? "admin@jaijinendranamkeens.com";

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "JaiJinendra@9875";
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
    password === getAdminPassword()
  );
}
