import { faker } from "@faker-js/faker";
import { expect, test } from "@playwright/test";
import { CLIENT_URL } from "tests/constants";

test("create and delete client", async ({ page }) => {
  await page.goto(CLIENT_URL);
  await expect(page).toHaveURL(/.{0,30}dashboard/);

  // create client
  const userName = faker.name.fullName();
  const userEmail = faker.internet.email(undefined, undefined, "kesowa.com", {
    allowSpecialCharacters: false,
  });
  const userPhone = faker.phone.number();
  page.on("filechooser", (fileChooser) => {
    fileChooser.setFiles(["tests/assets/image.png"]);
  });
  await page.getByRole("menuitem", { name: "shop Client" }).click();
  await page.getByRole("link", { name: "plus-circle Create Client" }).click();
  await page.getByPlaceholder("Client's name").click();
  await page.getByPlaceholder("Client's name").fill(userName);
  await page.getByLabel("User Group").click();
  await page.getByText("Client Access").first().click();
  await page.getByPlaceholder("Phone Number").click();
  await page.getByPlaceholder("Phone Number").fill(userPhone);
  await page.getByPlaceholder("Email Id").click();
  await page.getByPlaceholder("Email Id").fill(userEmail);
  await page.getByPlaceholder("Country").click();
  await page.getByPlaceholder("Country").fill(faker.address.country());
  await page.getByPlaceholder("City").click();
  await page.getByPlaceholder("City").fill(faker.address.city());
  await page.getByPlaceholder("Select date").click();
  await page.getByText("Today").click();
  await page.getByRole("button", { name: "plus Upload" }).click();
  await page.getByRole("button", { name: "OK" }).click();
  await page.getByRole("button", { name: "Create" }).click();
  await page
    .getByText("Client created! Check email to change password")
    .click();
  const clientCreateAlert = page.getByText(
    "Client created! Check email to change password"
  );
  expect(clientCreateAlert).toBeDefined();

  // go to client list page
  await page.getByRole("link", { name: "unordered-list Client List" }).click();

  // search for newly created client, by email id, and make sure it exists in list
  await page.getByRole('cell', { name: 'Email Id search' }).getByRole('button').click();
  await page.getByRole('textbox', { name: 'Search email' }).fill(userEmail);
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  expect(page.getByText(userEmail)).toBeDefined();

  // delete client
  await page
    .getByRole("row", { name: `${userName} ${userEmail} ${userPhone}` })
    .getByRole("button", { name: "delete" })
    .click();
  await page.getByRole("button", { name: "Yes" }).click();
  const clientDeleteAlert = page.getByText("client deleted successfully!");
  expect(clientDeleteAlert).toBeDefined();
});
