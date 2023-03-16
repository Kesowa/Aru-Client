import { test, expect, Page, FileChooser } from "@playwright/test";

test.describe("alert tests", () => {
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
    await page
      .getByText(/Outcomes.*/)
      .first()
      .click();
  });

  test.afterAll(async ({ browser }) => {
    browser.close();
  });

  const filename = "image.png";

  test("upload outcome", async () => {
    // for upload file popup
    page.on("filechooser", (fileChooser: FileChooser) => {
      fileChooser.setFiles(["tests/assets/image.png"]);
    });

    await page.getByRole("button", { name: "upload Upload" }).click();
    await page
      .getByRole("button", {
        name: "inbox Click or drag file to this area to upload Support for a single or bulk upload.",
      })
      .click();
    await page.waitForTimeout(1000); // wait for image to get uploaded
    await page
      .locator("div")
      .filter({ hasText: "Close" })
      .getByRole("button", { name: "Close" })
      .first()
      .click();

    const alertCreationNotification = page.getByText(
      `File ${filename} uploaded successfully`
    );
    expect(alertCreationNotification).toBeDefined();
  });

  test("delete outcome", async () => {
    await page.locator('//*[@class="ant-card-cover"]').first().click({
      button: "right",
    });
    await page.getByText("Delete").click();
    await page.getByRole("button", { name: "Yes" }).click();
    await page.waitForTimeout(2000);

    const alertDeletionNotification = page.getByText(
      "Outcome deleted succesfully!"
    );
    expect(alertDeletionNotification).toBeDefined();
  });
});
