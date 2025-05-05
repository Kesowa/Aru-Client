import { test } from "@playwright/test";
import { createAsset, deleteAsset } from "tests/utils/asset";

test("create and delete asset", async ({ page }) => {
  const assetName = await createAsset(page);
  await deleteAsset(page, assetName);
});
