import { expect, test } from "./fixtures";

test("artisan profile step only continues with valid details", async ({ page, pageErrors }) => {
  await page.goto("/artisan/onboarding?step=profile");

  const next = page.getByRole("button", { name: "Continue" });
  const name = page.locator("#full-name");

  await name.fill("Al");
  await expect(next).toBeDisabled();

  await name.fill("Chukwuemeka Obi");
  await page.getByRole("radio", { name: /plumber/i }).click();
  await page.locator("#years").fill("6");
  await expect(next).toBeEnabled();

  await next.click();
  await expect(page).toHaveURL(/step=identity/, { timeout: 20_000 });
  expect(pageErrors).toEqual([]);
});
