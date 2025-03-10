import { faker } from "@faker-js/faker";
import { expect, FileChooser, type Page } from "@playwright/test";

export const createVectorLayer = async (page: Page) => {
  // for upload file popup
  page.on("filechooser", (fileChooser: FileChooser) => {
    fileChooser.setFiles(["tests/assets/poles.geojson"]);
  });

  await page
    .getByRole("main")
    .getByRole("link", { name: "border-inner Missions" })
    .click();
  await page.getByRole("heading", { name: "Mapping mission sample" }).click();

  // initially page is already at the map tab
  await page.locator(".overlay-content").click(); // click on the map
  await page.getByRole("button", { name: "upload Upload" }).click(); // click on layer upload button
  await page.locator(".ant-card-body").first().click(); // choose upload file
  await page.getByRole("button", { name: "Next" }).click();

  // fill layer details
  const layername = "testVectorLayer" + faker.random.alphaNumeric(8); // random name;
  // layer name
  await page.getByPlaceholder("Layer's Name").fill(layername);
  // layer type selection
  await page.getByLabel("Layer Type").click();
  await page.getByLabel("Layer Type").fill("point");
  await page.getByTitle("Landmark").click();
  // date selection
  await page.getByPlaceholder("Select date").click();
  await page.getByText("Today").click();
  // upload geojson
  await page
    .getByRole("button", { name: "upload Select File" })
    .getByRole("button", { name: "upload Select File", exact: true })
    .filter({ hasText: "Select File" })
    .click(); // opens filechooser
  await page.waitForTimeout(2000);
  // save
  await page.getByRole("button", { name: "Save" }).click();
  await page.getByRole("button", { name: "Close" }).click();

  // click and expand Vector list
  await page
    .locator(
      '//*[@class="ant-tree-list-holder-inner"]//span[@class="ant-tree-switcher ant-tree-switcher_close"]'
    )
    .first()
    .click();

  // check if listed
  expect(
    await page
      .locator(
        `//*[@class="ant-tree-list-holder-inner"]//*[text()="${layername}"]`
      )
      .count()
  ).toBeGreaterThanOrEqual(1);

  return layername;
};

export const createRasterLayer = async (page: Page) => {
  // for upload file popup
  page.on("filechooser", (fileChooser: FileChooser) => {
    fileChooser.setFiles(["tests/assets/Ortho_25cm.tif"]);
  });

  await page
    .getByRole("main")
    .getByRole("link", { name: "border-inner Missions" })
    .click();
  await page.getByRole("heading", { name: "Mapping mission sample" }).click();

  // initially page is already at the map tab
  await page.locator(".overlay-content").click(); // click on the map
  await page.getByRole("button", { name: "upload Upload" }).click(); // click on layer upload button
  await page.locator(".ant-card-body").first().click(); // choose upload file
  await page.getByRole("button", { name: "Next" }).click();

  // fill layer details
  const layername = "testRasterLayer" + faker.random.alphaNumeric(8); // random name;
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
  await page.waitForTimeout(5000);
  await page.getByRole("button", { name: "Close" }).first().click();

  // click and expand Raster list
  await page
    .locator(
      '//*[@class="ant-tree-list-holder-inner"]//span[@class="ant-tree-switcher ant-tree-switcher_close"]'
    )
    .nth(1)
    .click();

  // check if listed
  expect(
    await page
      .locator(
        `//*[@class="ant-tree-list-holder-inner"]//*[text()="${layername}"]`
      )
      .count()
  ).toBeGreaterThanOrEqual(1);

  return layername;
};
