import { faker } from "@faker-js/faker";
import { expect, type Page } from "@playwright/test";
import { CLIENT_URL } from "tests/constants";

const gotoMissionTable = async (page: Page) => {
  // go to mission listing page
  await page.goto(CLIENT_URL);
  await expect(page).toHaveURL(/.{0,30}dashboard/);
  await page
    .getByRole("main")
    .getByRole("link", { name: "border-inner Missions" })
    .click();

  // assert table
  expect(page.getByRole("cell", { name: "Mission Name" })).toBeDefined();
  expect(page.getByRole("cell", { name: "Order Date" })).toBeDefined();
  expect(page.getByRole("cell", { name: "Flight Date" })).toBeDefined();
  expect(page.getByRole("cell", { name: "Mission ID" })).toBeDefined();
  expect(page.getByRole("cell", { name: "Created By" })).toBeDefined();
  expect(page.getByRole("cell", { name: "Status" })).toBeDefined();
  expect(page.getByRole("cell", { name: "Actions" })).toBeDefined();
}

export const createMission = async (page: Page) => {
  await page.goto(CLIENT_URL);
  await expect(page).toHaveURL(/.{0,30}dashboard/);
  await page.getByRole("link", { name: "diff Create Mission" }).click();

  // stage 1: mission type selection
  await page.getByText("Mapping", { exact: true }).click();
  await page.getByRole("button", { name: "Get to next stage" }).click();

  const missionName = faker.company.name();

  // stage 2: flight details
  await page.getByRole('textbox', { name: 'Flight Name' }).fill(missionName);
  await page.locator('.ant-picker').nth(0).click();
  await page.getByText('Today').click();
  await page.locator('.ant-picker').nth(1).click();
  await page.getByText('Now').click();
  await page.locator('#create_mission_duration').click();
  await page.getByText('1 Hr').click();
  await page.locator('#create_mission_locationId').click();
  await page.getByText('Base').click();
  await page.locator('#create_mission_pilot').click();
  await page.getByText('Neel Dutta pilot').click();
  await page.locator("#gmap_container").getByRole("img").nth(1).click();
  // map clicked twice to select circular region of radius 0
  const bb = await page
    .locator("div:nth-child(2) > div > div:nth-child(3) > div")
    .first()
    .boundingBox();

  await page.mouse.click(bb!.x + bb!.width / 2, bb!.y + bb!.height / 2);
  await new Promise((res) => setTimeout(res, 500));
  await page.mouse.click(bb!.x + bb!.width / 2, bb!.y + bb!.height / 2 + 100);
  await new Promise((res) => setTimeout(res, 2000)); // wait for location and area of geofence to be loaded from apis
  await page.getByRole('button', { name: 'Save' }).click();

  const flightCreateAlert = page.getByText("Flight Added");
  expect(flightCreateAlert).toBeDefined();

  // stage 3 : add mission details
  await page.getByRole('textbox', { name: 'Please provide with detailed' }).fill('Test Instructions'); // fill instructions
  await page.getByText("Orthomosaic").click();
  await page.getByText("No asset selected!").click();
  await page.getByText("NKDA Phantom").click();
  await page.getByRole("button", { name: "Submit" }).click();

  const missionCreateAlert = page.getByText(
    `New Mission Added!Mission with name "${missionName}" has been added.`
  );

  // after this, user gets re-directed to mission list page, with the mission listed there in the table
  expect(missionCreateAlert).toBeDefined();

  return missionName;
};

export const completeMission = async (page: Page, missionName: string) => {
  await gotoMissionTable(page);

  // open mission
  await page
    .getByRole("row", {
      name: missionName,
    })
    .getByRole('heading')
    .click();
  
  // assign pilot
  await page.getByRole('button', { name: 'user-add Assign Pilot' }).click();
  await page.getByRole('heading', { name: 'Neel Dutta pilot' }).click();
  await page.getByRole('button', { name: 'Assign', exact: true }).click();

  // complete mission
  await page.getByRole('button', { name: 'Mark for review' }).click();
  await page.getByRole('button', { name: 'Mark as completed' }).click();

  const missionCompletedAlert = page.getByText('Mission Completed!');
  expect(missionCompletedAlert).toBeDefined();
}

export const deleteMission = async (page: Page, missionName: string) => {
  await gotoMissionTable(page);

  // delete mission
  await page
    .getByRole("row", {
      name: missionName,
    })
    .getByRole("button", { name: "delete" })
    .click();
  await page.getByRole("button", { name: "Yes" }).click();

  const missionDeleteAlert = page.getByText(
    `Mission DeletedMission: ${missionName} is deleted!`
  );
  expect(missionDeleteAlert).toBeDefined();
}
