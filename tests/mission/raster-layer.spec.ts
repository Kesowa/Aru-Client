import { faker } from "@faker-js/faker";
import { test, expect, Page, FileChooser } from "@playwright/test";

test.describe("vector layer tests", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    page.goto("http://localhost:3000");
    await expect(page).toHaveURL(/.*dashboard/);
    await page
      .getByRole("main")
      .getByRole("link", { name: "border-inner Missions" })
      .click();
    await page.getByRole("heading", { name: "Mapping mission sample" }).click();
    await page.locator(".overlay-content").click(); // goto map
  });

  test.afterAll(async ({ browser }) => {
    browser.close();
  });

  const layername = faker.address.streetAddress();

  test("raster layer creation", async () => {
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
    await page.waitForTimeout(5000);
    await page.getByRole("button", { name: "Close" }).click();

    const layerCreationNotification = page.getByText("Layer created!");
    expect(layerCreationNotification).toBeDefined();
  });

  test("delete raster layer", async () => {
    // click and expand Raster list
    await page
      .locator(
        '//*[@class="ant-tree-list-holder-inner"]//span[@class="ant-tree-switcher ant-tree-switcher_close"]'
      )
      .nth(1)
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
  });
});
