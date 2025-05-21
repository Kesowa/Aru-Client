import { test } from "@playwright/test";
import { createClient, deleteClient } from "tests/utils/client";

test("create and delete client", async ({ page }) => {
  const { userName, userEmail, userPhone } = await createClient(page);
  await deleteClient(page, userEmail, userName, userPhone);
});
