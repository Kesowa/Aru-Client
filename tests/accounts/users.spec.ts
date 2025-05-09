import { test } from "@playwright/test";
import { createUser, deleteUser } from "tests/utils/user";

test("create and delete user", async ({ page }) => {
  const { userEmail, userGroupName, userGroupExisted } = await createUser(page);
  if (userGroupExisted) {
    await deleteUser(page, userEmail);
  } else {
    await deleteUser(page, userEmail, userGroupName);
  }
});
