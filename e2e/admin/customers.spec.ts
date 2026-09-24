import { test, expect } from "@playwright/test";

async function openFirstCustomer(page: import("@playwright/test").Page) {
  const row = page.locator("tbody tr[data-customer-id]").first();
  const count = await row.count();
  if (count === 0) return null;
  const id = await row.getAttribute("data-customer-id");
  if (!id) return null;
  await page.goto(`/admin/customers?customer=${id}`);
  return id;
}

test.describe("admin customers P0", () => {
  test("customers list loads", async ({ page }) => {
    await page.goto("/admin/customers");
    await expect(page.getByRole("heading", { name: /customers/i })).toBeVisible();
  });

  test("drawer opens from row and shows profile", async ({ page }) => {
    await page.goto("/admin/customers");
    const id = await openFirstCustomer(page);
    test.skip(!id, "No customers seeded");

    await expect(page).toHaveURL(new RegExp(`customer=${id}`));
    await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole("heading", { name: "Order history" })).toBeVisible();
  });

  test("synthetic phone email UX when present", async ({ page }) => {
    await page.goto("/admin/customers");
    const phoneRow = page
      .locator("tbody tr[data-customer-id]")
      .filter({ hasText: "Phone login" })
      .first();
    if ((await phoneRow.count()) === 0) {
      test.skip(true, "No phone-login customers in seed data");
    }

    const id = await phoneRow.getAttribute("data-customer-id");
    await page.goto(`/admin/customers?customer=${id}`);
    await expect(page.getByText(/phone account/i)).toBeVisible({
      timeout: 20_000,
    });
    const emailInput = page.getByLabel(/real email \(optional\)/i);
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveValue("");
  });

  test("close drawer clears customer query", async ({ page }) => {
    await page.goto("/admin/customers");
    const id = await openFirstCustomer(page);
    test.skip(!id, "No customers seeded");

    await expect(page).toHaveURL(new RegExp(`customer=${id}`));
    await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible({
      timeout: 20_000,
    });

    // Prefer close trigger; Escape as fallback
    const closeBtn = page.getByRole("button", { name: /close/i }).first();
    if (await closeBtn.count()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press("Escape");
    }
    await expect(page).not.toHaveURL(/customer=/);
  });

  test("mobile 390px drawer usable", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/admin/customers");
    const id = await openFirstCustomer(page);
    test.skip(!id, "No customers seeded");

    await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible({
      timeout: 20_000,
    });
    await expect(
      page.getByRole("button", { name: /save profile/i }),
    ).toBeVisible();
  });
});
