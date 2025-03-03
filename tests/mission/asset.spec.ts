import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { CLIENT_URL } from "tests/constants";

test("create and delete asset", async ({ page }) => {
  await page.goto(CLIENT_URL);
  await expect(page).toHaveURL(/.{0,30}dashboard/);

  // create asset
  const assetName = faker.random.word();
  await page.getByRole("link", { name: "Assets" }).click();
  await page.getByRole("button", { name: "Asset" }).click();
  await page.getByPlaceholder("Asset Name").fill(assetName);
  await page.getByLabel("Asset Type").click();
  await page.getByText("Throttle Aerospace Systems").click();
  await page
    .getByRole("menuitemcheckbox", { name: "MAVLINK Drone" })
    .getByText("MAVLINK Drone")
    .click();
  await page.getByLabel("Asset Owner").click();
  await page.getByTitle("NKDA").getByText("NKDA").click();
  await page
    .getByRole("row", { name: "UIN edit delete" })
    .locator("a")
    .first()
    .click();
  await page
    .locator("#create_mission_value")
    .fill(`${faker.random.numeric(5)}`);
  await page.getByRole("link", { name: "save" }).click();
  await page
    .getByRole("row", { name: "FCID edit delete" })
    .locator("a")
    .first()
    .click();
  await page
    .locator("#create_mission_value")
    .fill(`${faker.random.numeric(5)}`);
  await page.getByRole("link", { name: "save" }).click();
  await page
    .getByRole("row", { name: "serialNo edit delete" })
    .locator("a")
    .first()
    .click();
  await page
    .locator("#create_mission_value")
    .fill(`${faker.random.numeric(5)}`);
  await page.getByRole("link", { name: "save" }).click();
  await page.getByPlaceholder("Select date").click();
  await page.getByText("Now").click();
  await page.getByRole("button", { name: "Submit" }).click();

  const assetCreateAlert = page.getByText("Asset Created Successfully");
  expect(assetCreateAlert).toBeDefined();

  // delete asset
  await page.reload(); // because currently it is not getting updated in real time
  await page
    .getByRole("row", {
      name: assetName,
    })
    .getByRole("button", { name: "ellipsis" })
    .click();
  await page
    .getByRole("menuitem", { name: "delete Delete Asset" })
    .getByText("Delete Asset")
    .click();
  await page.getByRole("button", { name: "Yes" }).click();
  const assetDeleteAlert = page.getByText(`Asset ${assetName} deleted`);
  expect(assetDeleteAlert).toBeDefined();
});
