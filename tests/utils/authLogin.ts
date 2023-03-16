import { expect, type Page } from "@playwright/test";

export const loginTenantRoot = async (page: Page) => {
  await page.goto("http://localhost:3000");
  await expect(page).toHaveURL(/.*login/);

  await page
    .locator('xpath=//input[@placeholder="email id"]')
    .fill("admin@NKDA.com");

  await page
    .locator('xpath=//input[@placeholder="Password"]')
    .fill("fsipl1@3$");

  await page.locator('xpath=//button[@type="submit"]').click();

  await expect(page).toHaveURL(/.*dashboard/);
};
