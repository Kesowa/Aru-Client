import { test, FileChooser, expect } from "@playwright/test";
import { CLIENT_URL } from "tests/constants";
import { completeMission, createMission, deleteMission } from "tests/utils/mission";

// configuration for this file only
test.describe.configure({
  mode: 'default' // run tests sequentially, but dont stop when one fails, execute all tests
})

test("thermal image tests", async ({ page }) => {
  const missionName = await createMission(page);
  await completeMission(page, missionName);
  
  await page.goto(CLIENT_URL);
  await page
    .getByRole("menuitem", { name: "border-inner Missions" })
    .getByRole("link", { name: "border-inner Missions" })
    .click();
  await page.getByRole("heading", { name: missionName }).click();
  await page.getByText("Images").click();

  const filename = "thermalImage.jpg";

  // for upload file popup
  page.on("filechooser", (fileChooser: FileChooser) => {
    fileChooser.setFiles([`tests/assets/${filename}`]);
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

  // add a data point
  await page.locator('canvas').click({
    position: {
      x: 231,
      y: 165
    }
  });

  // add a label to the data point and save the data point
  await page.getByRole('textbox').click();
  await page.getByRole('textbox').fill('testLabel');
  await page.getByRole('button', { name: 'plus' }).click();
  expect(page.getByText('Label updated Successfully')).toBeDefined();
  await page.getByRole('button', { name: 'Submit' }).click();
  expect(page.getByText('Data points updated')).toBeDefined();

  // delete data point
  await page.getByText('Delete', { exact: true }).click();
  await page.getByRole('button', { name: 'Submit' }).click();
  expect(page.getByText('Data points updated')).toBeDefined();

  // close modal
  await page.getByRole('button', { name: 'Close' }).click();

  await deleteMission(page, missionName);
});

test("thermal view for non-thermal images", async ({ page }) => {
  const missionName = await createMission(page);
  await completeMission(page, missionName);

  await page.goto(CLIENT_URL);
  await page
    .getByRole("menuitem", { name: "border-inner Missions" })
    .getByRole("link", { name: "border-inner Missions" })
    .click();
  await page.getByRole("heading", { name: missionName }).click();
  await page.getByText("Images").click();

  const filename = "image.png";

  // for upload file popup
  page.on("filechooser", (fileChooser: FileChooser) => {
    fileChooser.setFiles([`tests/assets/${filename}`]);
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

  await deleteMission(page, missionName);
});
