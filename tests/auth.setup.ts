import { test as setup } from "@playwright/test";
import { loginTenantRoot } from "../tests/utils/authLogin";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await loginTenantRoot(page);
  await page.context().storageState({ path: authFile });
});
