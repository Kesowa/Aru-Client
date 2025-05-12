import { test } from "@playwright/test";
import { createAsset, deleteAsset } from "tests/utils/asset";
import { createManufacturer, deleteManufacturer } from "tests/utils/manufacturer";
import { createModel, deleteModel } from "tests/utils/model";
import { createUser, deleteUser } from "tests/utils/user";

test("create and delete asset", async ({ page }) => {
  // ownercreation
  const { userName, userEmail, userGroupName, userGroupExisted } = await createUser(page);

  // manufacturer creation
  const manufacturerName = await createManufacturer(page);

  // model creation
  const modelName = await createModel(page, manufacturerName);

  // asset creation
  const assetName = await createAsset(page, manufacturerName, modelName, userName);

  // asset deletion
  await deleteAsset(page, assetName);

  // model deletion
  await deleteModel(page, modelName);

  // manufacturer deletion
  await deleteManufacturer(page, manufacturerName);

  // owner deletion
  if (userGroupExisted) {
    await deleteUser(page, userEmail);
  } else {
    await deleteUser(page, userEmail, userGroupName);
  }
});
