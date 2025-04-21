import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { CLIENT_URL } from "tests/constants";

test("create and delete usergroup", async ({ page }) => {
  await page.goto(CLIENT_URL);
  await expect(page).toHaveURL(/.{0,30}dashboard/);

  // create usergroup
  const userGroupName = faker.random.word();
  await page.getByRole("link", { name: "User groups" }).click();
  await page.getByRole("button", { name: "Create User Group" }).click();
  await page.getByLabel("Group Name").fill(userGroupName);
  await page
    .getByRole("listitem")
    .filter({ hasText: "mission create" })
    .getByLabel("")
    .check();
  await page
    .getByRole("listitem")
    .filter({ hasText: "mission delete" })
    .getByLabel("")
    .check();
  await page.getByRole("button", { name: "right" }).click();
  await page.getByRole("button", { name: "Create Group" }).click();
  const usergroupCreateAlert = page.getByText("User Group created sucessfully");
  expect(usergroupCreateAlert).toBeDefined();

  // delete usergroup
  await page.getByRole("button", { name: "User Group List" }).click();
  await page.locator('//div[@aria-label="Page Size"]').click();
  await page.getByText("100 / page").click();
  await page
    .getByRole("row", { name: `${userGroupName} edit eye details delete` })
    .getByRole("button", { name: "delete" })
    .click();
  await page.getByRole("button", { name: "OK" }).click();
  const usergroupDeleteAlert = page.getByText(
    "User Group deleted successfully!"
  );
  expect(usergroupDeleteAlert).toBeDefined();
});
