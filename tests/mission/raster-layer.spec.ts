import { faker } from "@faker-js/faker";
import { test, expect, FileChooser } from "@playwright/test";
import { CLIENT_URL } from "tests/constants";
import { createMission, completeMission, deleteMission } from "tests/utils/mission";

test("raster layer tests", async ({ page }) => {
  const missionName = await createMission(page);
  await completeMission(page, missionName);

  const layername = faker.address.streetAddress();

  // Layer Creation

  await page.goto(CLIENT_URL);
  await expect(page).toHaveURL(/.{0,30}dashboard/);
  await page
    .getByRole("main")
    .getByRole("link", { name: "border-inner Missions" })
    .click();
  await page.getByRole("heading", { name: missionName }).click();
  await page.locator(".overlay-content").click(); // goto map
  // for upload file popup
  page.on("filechooser", (fileChooser: FileChooser) => {
    fileChooser.setFiles(["tests/assets/Ortho_25cm.tif"]);
  });
  await page.getByRole("button", { name: "upload Upload" }).click(); // click on layer upload button
  await page.locator(".ant-card-body").first().click(); // choose upload file
  await page.getByRole("button", { name: "Next" }).click();
  // fill layer details
  // layer name
  await page.getByPlaceholder("Layer's Name").fill(layername);
  // layer type selection
  await page.getByLabel("Layer Type").click();
  await page.getByLabel("Layer Type").fill("ORTHO");
  await page.getByTitle("ORTHO").click();
  // date selection
  await page.getByPlaceholder("Select date").click();
  await page.getByText("Today").click();
  // upload geojson
  await page
    .getByRole("button", { name: "upload Select File" })
    .getByRole("button", { name: "upload Select File", exact: true })
    .filter({ hasText: "Select File" })
    .click(); // opens filechooser
  // save
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForTimeout(10000);
  await page.getByRole("button", { name: "Close" }).click();
  const layerCreationNotification = page.getByText("Layer created!");
  expect(layerCreationNotification).toBeDefined();

  // Layer Deletion
  // click and expand Raster list
  await page
    .locator(
      '//*[@class="ant-tree-list-holder-inner"]//span[@class="ant-tree-switcher ant-tree-switcher_close"]'
    )
    .nth(0)
    .click();
  // right click on the previously created layer
  await page.locator(`//*[text()="${layername}"]`).click({
    button: "right",
  });
  // select delete
  await page
    .getByRole("menuitem", { name: "Delete" })
    .locator("span")
    .first()
    .click();
  await page.getByRole("button", { name: "Yes" }).click();
  await page.waitForTimeout(2000);
  const layerDeletionNotification = page.getByText(
    "Layer successfully deleted"
  );
  expect(layerDeletionNotification).toBeDefined();
  expect(
    await page
      .locator(
        `//*[@class="ant-tree-list-holder-inner"]//*[text()="${layername}"]`
      )
      .count()
  ).toBe(0);

  await deleteMission(page, missionName);
});
