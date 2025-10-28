import { expect, test } from "@playwright/test";

const PAGE_TITLE_PATTERN = /Glasify Lite/;

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(PAGE_TITLE_PATTERN);
});
