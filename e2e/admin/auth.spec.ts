import { test, expect } from "@playwright/test";

function isAuthedAdminUrl(url: string) {
  const p = new URL(url).pathname;
  return p === "/admin" || (p.startsWith("/admin/") && !p.startsWith("/admin/login"));
}

test.describe("admin auth P0", () => {
  test("guest /admin redirects to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("wrong password shows invalid credentials", async ({ page }) => {
    const email = process.env.ADMIN_EMAIL?.trim() || "admin@example.com";
    await page.goto("/admin/login");
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill("definitely-wrong-password-xyz");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(
      page.getByText(/invalid email or password/i),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("next deep-link rejects non-admin paths", async ({ page }) => {
    await page.goto("/admin/login?next=/account");
    const next = page.locator('input[name="next"]');
    await expect(next).toHaveValue("/admin");
  });

  test("valid admin reaches dashboard", async ({ page }) => {
    const email = process.env.ADMIN_EMAIL?.trim();
    const password = process.env.ADMIN_PASSWORD?.trim();
    test.skip(!email || !password, "ADMIN_EMAIL / ADMIN_PASSWORD not set");

    await page.goto("/admin/login");
    await page.getByLabel(/email/i).fill(email!);
    await page.getByLabel(/password/i).fill(password!);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect
      .poll(() => isAuthedAdminUrl(page.url()), { timeout: 30_000 })
      .toBe(true);
  });

  test("logout clears admin access", async ({ page }) => {
    const email = process.env.ADMIN_EMAIL?.trim();
    const password = process.env.ADMIN_PASSWORD?.trim();
    test.skip(!email || !password, "ADMIN_EMAIL / ADMIN_PASSWORD not set");

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/admin/login");
    await page.getByLabel(/email/i).fill(email!);
    await page.getByLabel(/password/i).fill(password!);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect
      .poll(() => isAuthedAdminUrl(page.url()), { timeout: 30_000 })
      .toBe(true);

    await page
      .getByRole("complementary")
      .getByRole("button", { name: /^sign out$/i })
      .click();
    const confirm = page
      .getByRole("alertdialog")
      .or(page.getByRole("dialog"))
      .getByRole("button", { name: /^sign out$/i });
    await confirm.click();
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 20_000 });

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
