import { test, FileChooser, expect } from "@playwright/test";
import { CLIENT_URL } from "tests/constants";

test("thermal image tests", async ({ page }) => {
  await page.goto(CLIENT_URL);
  await page
    .getByRole("menuitem", { name: "border-inner Missions" })
    .getByRole("link", { name: "border-inner Missions" })
    .click();
  await page.getByRole("heading", { name: "Rust Nature Sanctuary" }).click();
  await page.getByText("Images").click();
  await page
    .locator("span:nth-child(2) > .ant-badge > .ant-image > .ant-image-mask")
    .click({
      button: "right",
    });
  await page.getByText("Thermal View").click();

  const modalElement = page.locator("#canvas");

  await modalElement.hover();
  await page.waitForTimeout(2500);
  await page.getByRole("button", { name: "Close" }).click();
  await page.close();
});

const filename = "image.png";

test("thermal view for non-thermal images", async ({ page }) => {
  await page.goto(CLIENT_URL);
  await page
    .getByRole("menuitem", { name: "border-inner Missions" })
    .getByRole("link", { name: "border-inner Missions" })
    .click();
  await page.getByRole("heading", { name: "Rust Nature Sanctuary" }).click();
  await page.getByText("Images").click();

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
  await page.waitForTimeout(2000); // wait for image to get uploaded
  await page.getByRole("button", { name: "OK" }).click();

  const imageCreationNotification = page.getByText(
    `File ${filename} uploaded successfully`
  );
  expect(imageCreationNotification).toBeDefined();

  await page.locator(".ant-image-mask").first().click({
    button: "right",
  });
  await page.getByText("Thermal View").click();
  const nonThermalImageNotification = page.getByText(
    "Selected image does not have a thermal view."
  );
  expect(nonThermalImageNotification).toBeDefined();
});
