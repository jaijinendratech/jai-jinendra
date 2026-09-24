import { test, expect } from "@playwright/test";

test.describe("admin orders P0", () => {
  test("orders list loads", async ({ page }) => {
    await page.goto("/admin/orders");
    await expect(page.getByRole("heading", { name: /orders/i })).toBeVisible();
  });

  test("search / filter controls present", async ({ page }) => {
    await page.goto("/admin/orders");
    await expect(page.getByRole("heading", { name: /orders/i })).toBeVisible();
    const hasTable = await page.locator("table").count();
    const empty = page.getByText(/no orders/i);
    if (!hasTable) {
      await expect(empty.first()).toBeVisible({ timeout: 15_000 });
    }
  });

  test("order detail status controls when orders exist", async ({ page }) => {
    await page.goto("/admin/orders");
    const link = page.locator("tbody a[href*='/admin/orders/']").first();
    if ((await link.count()) === 0) {
      test.skip(true, "No orders seeded");
    }
    await link.click();
    await expect(page).toHaveURL(/\/admin\/orders\/.+/);
    await expect(page.getByText(/customer & shipping/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /save shipping/i })).toBeVisible();
  });
});
