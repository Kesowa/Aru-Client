import { test, expect, FileChooser } from "@playwright/test";

const filename = "video.mp4";

test("vod tests", async ({ page }) => {
  // Upload VOD

  // navigating to mission videos page of "Mapping mission sample" mission
  page.goto("http://localhost:3000");
  await expect(page).toHaveURL(/.*dashboard/);
  await page
    .getByRole("main")
    .getByRole("link", { name: "border-inner Missions" })
    .click();
  await page.getByRole("heading", { name: "Mapping mission sample" }).click();
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

  // Delete VOD

  await page.locator("img").nth(1).click({
    button: "right",
  });
  await page.getByText("Delete video").click();
  await page.getByRole("button", { name: "Yes" }).click();
  await page.waitForTimeout(5000);

  const vodDeletionNotification = page.getByText("Video deleted succesfully!");
  expect(vodDeletionNotification).toBeDefined();
});
