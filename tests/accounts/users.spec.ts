import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

test("create and delete user", async ({ page }) => {
  page.goto("http://localhost:3000");
  await expect(page).toHaveURL(/.*dashboard/);

  // create user
  const userName = faker.name.fullName();
  const userEmail = faker.internet.email(undefined, undefined, "kesowa.com", {
    allowSpecialCharacters: false,
  });
  const userPhone = faker.phone.number();
  page.on("filechooser", (fileChooser) => {
    fileChooser.setFiles(["tests/assets/image.png"]);
  });
  await page.getByRole("menuitem", { name: "user User" }).click();
  await page.getByRole("link", { name: "plus-circle Create User" }).click();
  await page.getByPlaceholder("User's name").click();
  await page.getByPlaceholder("User's name").fill(userName);
  await page.getByLabel("User Group").click();
  await page.getByText("pilot/analyst").click();
  await page.getByPlaceholder("Phone Number").click();
  await page.getByPlaceholder("Phone Number").fill(userPhone);
  await page.getByPlaceholder("Email Id").click();
  await page.getByPlaceholder("Email Id").fill(userEmail);
  await page.getByPlaceholder("Select date").click();
  await page.getByText("Today").click();
  await page.getByRole("button", { name: "plus Upload" }).click();
  // await page.getByRole('button', { name: 'plus Upload' }).setInputFiles('./tests/assets/image.png');
  await page.getByRole("button", { name: "OK" }).click();
  await page.getByRole("button", { name: "Create" }).click();
  const userCreateAlert = page.getByText(
    "User created! Check email to change password"
  );
  expect(userCreateAlert).toBeDefined();

  // delete user
  await page.getByRole("link", { name: "unordered-list User List" }).click();
  await page
    .getByRole("row", { name: `${userName} ${userEmail} ${userPhone}` })
    .getByRole("button", { name: "delete" })
    .click();
  await page.getByRole("button", { name: "Yes" }).click();
  const userDeleteAlert = page.getByText("User deleted successfully!");
  expect(userDeleteAlert).toBeDefined();
});
