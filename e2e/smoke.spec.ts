import { test, expect } from "@playwright/test";

/**
 * Smoke / scaffold. Full COD path needs Supabase + seeded catalogue.
 * Mock Razorpay verify is covered in unit tests; e2e expand when staging is ready.
 */
test.describe("storefront smoke", () => {
  test("home loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Jai Jinendra/i);
  });

  test("login page renders", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });

  test("cart page reachable", async ({ page }) => {
    await page.goto("/cart");
    await expect(page).toHaveURL(/cart/);
  });
});
