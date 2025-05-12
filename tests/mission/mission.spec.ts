import { test } from "@playwright/test";
import { createAsset, deleteAsset } from "tests/utils/asset";
import { createManufacturer, deleteManufacturer } from "tests/utils/manufacturer";
import { completeMission, createMission, deleteMission } from "tests/utils/mission";
import { createModel, deleteModel } from "tests/utils/model";
import { createUser, deleteUser } from "tests/utils/user";

test("create and delete mission", async ({ page }) => {
  const locationName = "Base"; // TODO: Static value used, but we have removed functionality for location entity, flight form is yet to be updated
  // after flight form is updated, no location will be required, the center of the flight geofence will be set as the location

  // pilot creation
  const { userName: pilotName, userEmail, userGroupName, userGroupExisted } = await createUser(page, "pilot");

  // manufacturer creation
  const manufacturerName = await createManufacturer(page);
  
  // model creation
  const modelName = await createModel(page, manufacturerName);

  // asset creation
  const assetName = await createAsset(page, manufacturerName, modelName, pilotName); // re-using pilot as owner

  // mission creation
  const missionName = await createMission(page, locationName, pilotName, assetName);

  // mission completion
  await completeMission(page, missionName, pilotName);

  // mission deletion
  await deleteMission(page, missionName);

  // asset deletion
  await deleteAsset(page, assetName);

  // model deletion
  await deleteModel(page, modelName);

  // manufacturer deletion
  await deleteManufacturer(page, manufacturerName);
  
  // pilot deletion
  if (userGroupExisted) {
    await deleteUser(page, userEmail);
  } else {
    await deleteUser(page, userEmail, userGroupName);
  }
});
