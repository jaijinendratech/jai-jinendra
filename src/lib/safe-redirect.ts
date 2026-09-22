/**
 * Same-origin relative path only: must start with `/` but not `//`
 * (blocks protocol-relative and open redirects).
 */
const SAFE_PATH = /^\/(?!\/)/;

export function safeRedirectPath(
  candidate: string | null | undefined,
  fallback: string,
): string {
  if (!candidate) return fallback;
  const trimmed = candidate.trim();
  if (!SAFE_PATH.test(trimmed)) return fallback;
  if (trimmed.includes("//")) return fallback;
  if (trimmed.includes("\\")) return fallback;
  return trimmed;
}

/** Admin post-login destinations must stay under /admin. */
export function safeAdminRedirectPath(
  candidate: string | null | undefined,
  fallback = "/admin",
): string {
  const path = safeRedirectPath(candidate, fallback);
  if (!path.startsWith("/admin")) return fallback;
  return path;
}
