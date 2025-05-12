import { test } from "@playwright/test";
import { createManufacturer, deleteManufacturer } from "tests/utils/manufacturer";
import { createModel, deleteModel } from "tests/utils/model";

test("create and delete model", async ({ page }) => {
  // manufacturer creation
  const manufacturerName = await createManufacturer(page);

  // model creation
  const modelName = await createModel(page, manufacturerName);

  // model deletion
  await deleteModel(page, modelName);

  // manufacturer deletion
  await deleteManufacturer(page, manufacturerName);
});
