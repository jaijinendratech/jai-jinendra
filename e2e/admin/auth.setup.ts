import { test as setup, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const authFile = path.join(__dirname, "../.auth/admin.json");

function isAuthedAdminUrl(url: URL) {
  const p = url.pathname;
  return p === "/admin" || (p.startsWith("/admin/") && !p.startsWith("/admin/login"));
}

setup("authenticate as admin", async ({ page }) => {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env for admin e2e.",
    );
  }

  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  await page.goto("/admin/login");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect
    .poll(() => isAuthedAdminUrl(new URL(page.url())), { timeout: 30_000 })
    .toBe(true);
  await expect(page.getByRole("heading").first()).toBeVisible();

  const cookies = await page.context().cookies();
  if (!cookies.length) {
    throw new Error("Admin login succeeded but no cookies were stored.");
  }

  await page.context().storageState({ path: authFile });
});
