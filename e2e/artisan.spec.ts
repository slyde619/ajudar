import { expect, test } from "./fixtures";

test("artisan toggles availability and gets a toast", async ({ page, pageErrors }) => {
  await page.goto("/artisan");
  const toggle = page.getByRole("switch", { name: /online for new jobs/i });
  await expect(toggle).toBeVisible();

  const wasOnline = (await toggle.getAttribute("aria-checked")) === "true";
  await toggle.click();
  const toast = page.getByRole("region", { name: /notifications/i }).getByText(wasOnline ? "You're offline" : "You're online for new jobs");
  await expect(toast).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-checked", wasOnline ? "false" : "true");

  await page.mouse.move(0, 0);
  await expect(toast).toBeHidden({ timeout: 15_000 });

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", wasOnline ? "true" : "false");
  expect(pageErrors).toEqual([]);
});
