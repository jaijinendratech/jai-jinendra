import { describe, expect, it } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit (memory)", () => {
  it("allows up to limit then blocks", async () => {
    const key = `test:${Date.now()}:${Math.random()}`;
    const a = await rateLimit({ key, limit: 2, windowMs: 60_000 });
    const b = await rateLimit({ key, limit: 2, windowMs: 60_000 });
    const c = await rateLimit({ key, limit: 2, windowMs: 60_000 });
    expect(a.success).toBe(true);
    expect(b.success).toBe(true);
    expect(c.success).toBe(false);
  });
});
