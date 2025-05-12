import { test, expect, FileChooser } from "@playwright/test";
import { CLIENT_URL } from "tests/constants";
import { prepareMissionForTest, cleanupMissionAfterTest } from "tests/utils/missionDependencies";

const filename = "image.png";

test("image tests", async ({ page }) => {
  const missionDetails = await prepareMissionForTest(page);
  const { missionName } = missionDetails;
  
  // Upload Image

  // navigating to mission images page of mission
  await page.goto(CLIENT_URL);
  await expect(page).toHaveURL(/.{0,30}dashboard/);
  await page
    .getByRole("main")
    .getByRole("link", { name: "border-inner Missions" })
    .click();
  await page.getByRole("heading", { name: missionName }).click();
  await page
    .getByText(/Images.*/)
    .first()
    .click();

  // for upload file popup
  page.removeAllListeners('filechooser');
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
  await page.getByRole("button", { name: "OK" }).click();

  const imageCreationNotification = page.getByText(
    `File ${filename} uploaded successfully`
  );
  expect(imageCreationNotification).toBeDefined();

  // Delete Image

  await page.locator(".ant-image-mask").first().click({
    button: "right",
  });
  await page.getByText("Delete").click();
  await page.getByRole("button", { name: "Yes" }).click();
  await page.waitForTimeout(2000);

  const imageDeletionNotification = page.getByText("File deleted succesfully!");
  expect(imageDeletionNotification).toBeDefined();

  await cleanupMissionAfterTest({ page, ...missionDetails });
});
