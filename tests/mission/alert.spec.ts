import { test, expect, FileChooser } from "@playwright/test";
import { CLIENT_URL } from "tests/constants";
import { cleanupMissionAfterTest, prepareMissionForTest } from "tests/utils/missionDependencies";

const filename = "image.png";

test("alert tests", async ({ page }) => {
  const missionDetails = await prepareMissionForTest(page);
  const { missionName } = missionDetails;
  
  // Upload Alert

  // navigating to mission alerts page of mission
  await page.goto(CLIENT_URL);
  await expect(page).toHaveURL(/.{0,30}dashboard/);
  await page
    .getByRole("main")
    .getByRole("link", { name: "border-inner Missions" })
    .click();
  await page.getByRole("heading", { name: missionName }).click();
  await page
    .getByText(/Outcomes.*/)
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

  // Delete Alert

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

  await cleanupMissionAfterTest({ page, ...missionDetails });
});
