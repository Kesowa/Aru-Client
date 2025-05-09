import { test } from "@playwright/test";
import { createUserGroup, deleteUserGroup } from "tests/utils/usergroup";

test("create and delete usergroup", async ({ page }) => {
  const { userGroupName, existed } = await createUserGroup(page);
  if (!existed) {
    await deleteUserGroup(page, userGroupName);
  }
});
