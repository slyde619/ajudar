import { expect, seedLocation, test } from "./fixtures";

test("customer books a plumber from description to escrow", async ({ page, pageErrors }) => {
  await seedLocation(page);
  await page.goto("/booking/new?category=plumbing-repair");

  const submit = page.getByRole("button", { name: /see your estimate/i });
  await page.locator("#job-title").fill("Leak");
  await expect(submit).toBeDisabled();

  await page.locator("#job-title").fill("Burst pipe under the kitchen sink");
  await page.locator("#job-description").fill("Water is pooling under the sink and the valve is closed.");
  await expect(submit).toBeEnabled();
  await submit.click();

  await expect(page).toHaveURL(/\/booking\/[\w-]+$/);
  await page.getByRole("button", { name: "Find an artisan" }).last().click();

  const choose = page.getByRole("button", { name: /^choose /i }).last();
  await expect(choose).toBeVisible({ timeout: 45_000 });
  await choose.click();

  const accept = page.getByRole("button", { name: /^accept ₦/i }).last();
  await expect(accept).toBeVisible({ timeout: 30_000 });
  await accept.click();

  await page.getByRole("button", { name: /continue to secure checkout/i }).last().click();
  await expect(page).toHaveURL(/\/jobs\/[\w-]+$/, { timeout: 30_000 });

  expect(pageErrors).toEqual([]);
});
