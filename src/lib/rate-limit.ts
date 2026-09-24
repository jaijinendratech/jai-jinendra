/**
 * Fixed-window in-memory rate limiter (best-effort per instance).
 */

type WindowState = { count: number; resetAt: number };

const memory = new Map<string, WindowState>();

function memoryLimit(
  key: string,
  limit: number,
  windowMs: number,
): { success: boolean; remaining: number } {
  const now = Date.now();
  const cur = memory.get(key);
  if (!cur || cur.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }
  if (cur.count >= limit) {
    return { success: false, remaining: 0 };
  }
  cur.count += 1;
  return { success: true, remaining: limit - cur.count };
}

export async function rateLimit(params: {
  key: string;
  limit: number;
  windowMs?: number;
}): Promise<{ success: boolean; remaining: number }> {
  const windowMs = params.windowMs ?? 60_000;
  return memoryLimit(params.key, params.limit, windowMs);
}

export function clientIp(request: Request): string {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}
