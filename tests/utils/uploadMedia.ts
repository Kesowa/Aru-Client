import { expect, FileChooser, type Page } from "@playwright/test";

export const uploadAlert = async (page: Page) => {
  // for upload file popup
  page.on("filechooser", (fileChooser: FileChooser) => {
    fileChooser.setFiles(["tests/assets/image.png"]);
  });

  await page
    .getByRole("main")
    .getByRole("link", { name: "border-inner Missions" })
    .click();
  await page.getByRole("heading", { name: "Mapping mission sample" }).click();
  await page
    .getByText(/Outcomes.*/)
    .first()
    .click();

  const initialAlertCount = await page.locator("//img").count();

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

  const finalAlertCount = await page.locator("//img").count();

  expect(finalAlertCount).toBe(initialAlertCount + 1);
};

export const uploadDocument = async (page: Page) => {
  // for upload file popup
  page.on("filechooser", (fileChooser: FileChooser) => {
    fileChooser.setFiles(["tests/assets/image.png"]);
  });

  await page
    .getByRole("main")
    .getByRole("link", { name: "border-inner Missions" })
    .click();
  await page.getByRole("heading", { name: "Mapping mission sample" }).click();
  await page
    .getByText(/Documents.*/)
    .first()
    .click();

  const initialDocumentCount = await page
    .locator('xpath=//*[contains(@class, "chonky-gridContainer")]/div/div')
    .count();

  await page.getByRole("button", { name: "Upload files" }).click();
  await page
    .getByRole("button", {
      name: "inbox Click or drag file to this area to upload Support for a single or bulk upload.",
    })
    .click();
  await page.waitForTimeout(1000); // wait for document(image) to get uploaded
  await page.getByRole("button", { name: "OK" }).click();

  const finalDocumentCount = await page
    .locator('xpath=//*[contains(@class, "chonky-gridContainer")]/div/div')
    .count();

  expect(finalDocumentCount).toBe(initialDocumentCount + 1);
};

export const uploadImage = async (page: Page) => {
  // for upload file popup
  page.on("filechooser", (fileChooser: FileChooser) => {
    fileChooser.setFiles(["tests/assets/image.png"]);
  });

  await page
    .getByRole("main")
    .getByRole("link", { name: "border-inner Missions" })
    .click();
  await page.getByRole("heading", { name: "Mapping mission sample" }).click();
  await page
    .getByText(/Images.*/)
    .first()
    .click();

  const initialImageCount = await page.locator("//img").count();

  await page.getByRole("button", { name: "upload Upload" }).click();
  await page
    .getByRole("button", {
      name: "inbox Click or drag file to this area to upload Support for a single or bulk upload.",
    })
    .click();
  await page.waitForTimeout(1000); // wait for image to get uploaded
  await page.getByRole("button", { name: "OK" }).click();

  const finalImageCount = await page.locator("//img").count();

  expect(finalImageCount).toBe(initialImageCount + 1);
};

export const uploadVideo = async (page: Page) => {
  // for upload file popup
  page.on("filechooser", (fileChooser: FileChooser) => {
    fileChooser.setFiles(["tests/assets/video.mp4"]);
  });

  await page
    .getByRole("main")
    .getByRole("link", { name: "border-inner Missions" })
    .click();
  await page.getByRole("heading", { name: "Mapping mission sample" }).click();
  await page
    .getByText(/Videos.*/)
    .first()
    .click();

  const initialVideoCount = await page.locator("//img").count(); // counting by thumbnails

  await page.getByRole("button", { name: "upload Upload" }).click();
  await page
    .getByRole("button", {
      name: "inbox Click or drag file to this area to upload Support for a single or bulk upload.",
    })
    .click();
  await page.waitForTimeout(5000); // wait for video to get uploaded
  await page.getByRole("button", { name: "Close" }).click();

  const finalVideoCount = await page.locator("//img").count(); // counting by thumbnails

  expect(finalVideoCount).toBe(initialVideoCount + 1);
};
