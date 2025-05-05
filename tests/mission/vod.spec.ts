import { test, expect, FileChooser } from "@playwright/test";
import { CLIENT_URL } from "tests/constants";
import { completeMission, createMission, deleteMission } from "tests/utils/mission";

// configuration for this file only
test.describe.configure({
  timeout: 90_000 // 90 seconds timeout, only for this file's tests 
})

const filename = "video.mp4";

test("vod tests", async ({ page }) => {
  const missionName = await createMission(page);
  await completeMission(page, missionName);
  
  // Upload VOD

  // navigating to mission videos page of mission
  await page.goto(CLIENT_URL);
  await expect(page).toHaveURL(/.{0,30}dashboard/);
  await page
    .getByRole("main")
    .getByRole("link", { name: "border-inner Missions" })
    .click();
  await page.getByRole("heading", { name: missionName }).click();
  await page
    .getByText(/Videos.*/)
    .first()
    .click();

  // for upload file popup
  page.on("filechooser", (fileChooser: FileChooser) => {
    fileChooser.setFiles(["tests/assets/video.mp4"]);
  });

  await page.getByRole("button", { name: "upload Upload" }).click();
  await page
    .getByRole("button", {
      name: "inbox Click or drag file to this area to upload Support for a single or bulk upload.",
    })
    .click();
  await page.waitForTimeout(5000); // wait for video to get uploaded
  await page.getByRole("button", { name: "Close" }).click();

  const vodCreationNotification = page.getByText(
    `File ${filename} uploaded successfully`
  );
  expect(vodCreationNotification).toBeDefined();

  // Wait for vod to be processed, and verify processed notification
  const vodProcessedNotification = page.getByText(`Finished Processing!`);
  expect(vodProcessedNotification).toBeDefined();

  // Delete VOD

  await page.locator("img").nth(1).click({
    button: "right",
  });
  await page.getByText("Delete video").click();
  await page.getByRole("button", { name: "Yes" }).click();
  await page.waitForTimeout(5000);

  const vodDeletionNotification = page.getByText("Video deleted succesfully!");
  expect(vodDeletionNotification).toBeDefined();

  await deleteMission(page, missionName);
});
