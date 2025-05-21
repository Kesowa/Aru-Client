import { test } from "@playwright/test";
import { completeMission, createMission, deleteMission } from "tests/utils/mission";

test("create mission", async ({ page }) => {
  const missionName = await createMission(page);
  await completeMission(page, missionName);
  await deleteMission(page, missionName);
});
