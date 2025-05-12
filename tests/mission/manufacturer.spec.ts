import { test } from "@playwright/test";
import { createManufacturer, deleteManufacturer } from "tests/utils/manufacturer";

test("create and delete manufacturer", async ({ page }) => {
  const manufacturerName = await createManufacturer(page);
  await deleteManufacturer(page, manufacturerName);
});
