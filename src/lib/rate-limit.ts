/**
 * Fixed-window rate limiter.
 * Uses Upstash Redis when UPSTASH_REDIS_REST_URL + TOKEN are set;
 * otherwise in-memory (best-effort per instance).
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

async function upstashLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ success: boolean; remaining: number } | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
  const redisKey = `rl:${key}`;

  try {
    const incr = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", redisKey],
        ["EXPIRE", redisKey, windowSec, "NX"],
      ]),
    });
    if (!incr.ok) return null;
    const results = (await incr.json()) as { result: number }[];
    const count = Number(results?.[0]?.result ?? 0);
    return {
      success: count <= limit,
      remaining: Math.max(0, limit - count),
    };
  } catch {
    return null;
  }
}

export async function rateLimit(params: {
  key: string;
  limit: number;
  windowMs?: number;
}): Promise<{ success: boolean; remaining: number }> {
  const windowMs = params.windowMs ?? 60_000;
  const remote = await upstashLimit(params.key, params.limit, windowMs);
  if (remote) return remote;
  return memoryLimit(params.key, params.limit, windowMs);
}

export function clientIp(request: Request): string {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}
