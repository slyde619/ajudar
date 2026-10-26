import { test as base, expect, type Page } from "@playwright/test";

/** A confirmed Obio/Akpor site, as the location gate would persist it. */
export const MANUAL_SITE = {
  state: {
    location: {
      status: "manual",
      site: {
        lat: 4.8396,
        lng: 6.9984,
        lgaCode: "NG-RI-OBIO-AKPOR",
        landmark: "Blue gate opposite the Rumuola Road pharmacy",
        pinConfirmedByUser: true,
      },
    },
  },
  version: 1,
};

/** Collects uncaught errors and console errors so every test can assert the page stayed healthy. */
export const test = base.extend<{ pageErrors: string[] }>({
  pageErrors: async ({ page }, run) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`console: ${message.text()}`);
    });
    await run(errors);
  },
});

export async function seedLocation(page: Page) {
  await page.addInitScript((value) => {
    window.localStorage.setItem("ajudar.location", JSON.stringify(value));
  }, MANUAL_SITE);
}

export { expect };
