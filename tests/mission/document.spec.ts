import { test, expect, FileChooser } from "@playwright/test";

const filename = "image.png";

test("document tests", async ({ page }) => {
  // Document Creation

  // navigating to mission documents page of "Mapping mission sample" mission
  page.goto("http://localhost:3000");
  await expect(page).toHaveURL(/.*dashboard/);
  await page
    .getByRole("main")
    .getByRole("link", { name: "border-inner Missions" })
    .click();
  await page.getByRole("heading", { name: "Mapping mission sample" }).click();
  await page
    .getByText(/Documents.*/)
    .first()
    .click();

  // for upload file popup
  page.on("filechooser", (fileChooser: FileChooser) => {
    fileChooser.setFiles(["tests/assets/image.png"]);
  });

  await page.getByRole("button", { name: "Upload files" }).click();
  await page
    .getByRole("button", {
      name: "inbox Click or drag file to this area to upload Support for a single or bulk upload.",
    })
    .click();
  await page.waitForTimeout(1000); // wait for document(image) to get uploaded
  await page.getByRole("button", { name: "OK" }).click();

  const documentCreationNotification = page.getByText(
    `File ${filename} uploaded successfully`
  );
  expect(documentCreationNotification).toBeDefined();

  // Document Deletion

  await page
    .locator('xpath=//*[contains(@class, "chonky-gridContainer")]/div/div')
    .nth(1)
    .click({
      button: "right",
    });
  await page.getByText("Delete files").first().click();
  await page.getByRole("button", { name: "Yes" }).click();
  await page.waitForTimeout(2000);

  const documentDeletionNotification = page.getByText(
    "File deleted succesfully!"
  );
  expect(documentDeletionNotification).toBeDefined();
});
