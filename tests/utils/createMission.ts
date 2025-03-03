import { faker } from "@faker-js/faker";
import { expect, type Page } from "@playwright/test";

export const createMission = async (page: Page) => {
  await page.getByRole("link", { name: "diff Create Mission" }).click();
  const missionName: string =
    "Test-" + faker.random.alphaNumeric(8); // random mission name

  // stage 1: mission type selection
  await page.getByText("Mapping", { exact: true }).click();
  await page.getByRole("button", { name: "Get to next stage" }).click();

  // stage 2: flight details
  await page.getByLabel("Flight Name").click();
  await page.getByLabel("Flight Name").fill(missionName);
  await page.locator("#create_mission_duration").click();
  await page.getByText("2 Hrs").click();
  await page.locator("#create_mission_locationId").click();
  await page.getByText("Base").click();
  await page.locator("#gmap_container").getByRole("img").nth(1).click();
  // map clicked twice to select circular region of radius 0
  const bb = await page
    .locator("div:nth-child(2) > div > div:nth-child(3) > div")
    .first()
    .boundingBox();
  await page.mouse.move(bb!.x + bb!.width / 2, bb!.y + bb!.height / 2);
  await page.mouse.down();
  await page.mouse.move(bb!.x + bb!.width / 2, bb!.y + bb!.height / 2 + 100);
  await page.mouse.up();
  await page.mouse.click(bb!.x + bb!.width / 2, bb!.y + bb!.height / 2 + 100);
  await page.getByRole("button", { name: "Add" }).click();

  // stage 3 : add mission details
  await page
    .getByPlaceholder("Please provide with some instructions")
    .fill("Test Instructions"); // fill instructions
  await page.getByText("Orthomosaic").click();
  await page.getByText("No asset selected!").click();
  await page.getByText("NKDA Phantom").click();
  await page.getByRole("button", { name: "Submit" }).click();

  // after this; on success; mission list will appear with the name of the new mission on it
  expect(await page.getByText(missionName, { exact: true }).count()).toBe(1);

  return missionName;
};
