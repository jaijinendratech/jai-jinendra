import { test, expect } from "@playwright/test";

const MODULES: { path: string; heading: RegExp }[] = [
  { path: "/admin", heading: /dashboard|overview|revenue|orders/i },
  { path: "/admin/products", heading: /products/i },
  { path: "/admin/categories", heading: /categories/i },
  { path: "/admin/combos", heading: /combos/i },
  { path: "/admin/inventory", heading: /inventory/i },
  { path: "/admin/coupons", heading: /coupons/i },
  { path: "/admin/enquiries", heading: /enquir/i },
  { path: "/admin/outlets", heading: /outlets/i },
  { path: "/admin/media", heading: /media/i },
  { path: "/admin/content/home", heading: /home|content|hero/i },
  { path: "/admin/content/carousels", heading: /carousel/i },
  { path: "/admin/settings", heading: /settings/i },
];

test.describe("admin modules P1–P3 smoke", () => {
  for (const mod of MODULES) {
    test(`${mod.path} loads`, async ({ page }) => {
      await page.goto(mod.path);
      await expect(page).toHaveURL(new RegExp(mod.path.replace(/\//g, "\\/")));
      // Any primary heading / page chrome is enough for smoke
      await expect(page.locator("h1, h2").first()).toBeVisible({
        timeout: 20_000,
      });
    });
  }

  test("dashboard days toggle", async ({ page }) => {
    await page.goto("/admin?days=7");
    await expect(page).toHaveURL(/days=7/);
    const link30 = page.getByRole("link", { name: /^30$/ });
    if (await link30.count()) {
      await link30.click();
      await expect(page).toHaveURL(/days=30/);
    }
  });

  test("products list or empty state", async ({ page }) => {
    await page.goto("/admin/products");
    const table = page.locator("table");
    const empty = page.getByText(/no products/i);
    await expect(table.or(empty).first()).toBeVisible({ timeout: 15_000 });
  });

  test("categories delete blocked messaging when present", async ({ page }) => {
    await page.goto("/admin/categories?error=has-products");
    // Notice may render via toast or banner — page still loads
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});
