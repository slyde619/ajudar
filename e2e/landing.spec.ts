import { expect, test } from "./fixtures";

test("hero greets in English and Pidgin only", async ({ page, pageErrors }) => {
  await page.goto("/");

  const hero = page.locator("h1");
  await expect(hero.locator('[lang="en"]')).toBeVisible();
  await expect(hero.locator('[lang="pcm"]')).toBeAttached({ timeout: 10_000 });
  await expect(hero.locator(':is([lang="ig"], [lang="yo"], [lang="ha"])')).toHaveCount(0);
  expect(pageErrors).toEqual([]);
});

test("liquid CTAs lead to sign-up with the right role", async ({ page, pageErrors }) => {
  await page.goto("/");

  const closing = page.getByRole("region", { name: "Get your Saturday back." });
  const earn = closing.getByRole("link", { name: "Earn with ajudar", exact: true });
  await earn.scrollIntoViewIfNeeded();
  await earn.click();
  await expect(page).toHaveURL(/\/signup\?as=artisan$/);
  expect(pageErrors).toEqual([]);
});
