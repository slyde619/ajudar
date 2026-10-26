import { expect, test } from "./fixtures";

const ROUTES = [
  "/",
  "/signup",
  "/onboarding",
  "/dashboard",
  "/booking/new?category=plumbing-repair",
  "/artisans/art_chinedu_okafor",
  "/jobs",
  "/jobs/job_001",
  "/messages",
  "/profile",
  "/artisan",
  "/artisan/jobs",
  "/artisan/jobs/job_090",
  "/artisan/earnings",
  "/artisan/profile",
  "/artisan/onboarding",
  "/artisan/onboarding/status",
];

for (const route of ROUTES) {
  test(`renders ${route} without errors`, async ({ page, pageErrors }) => {
    const response = await page.goto(route);
    expect(response?.status(), `HTTP status for ${route}`).toBeLessThan(400);
    await expect(page.locator("main, body").first()).toBeVisible();
    await page.waitForLoadState("networkidle");
    expect(pageErrors).toEqual([]);
  });
}

test("unknown routes return 404", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
});
