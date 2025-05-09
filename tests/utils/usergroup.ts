import { faker } from "@faker-js/faker";
import { expect, Page } from "@playwright/test";
import { CLIENT_URL } from "tests/constants";

export const createUserGroup = async (page: Page, groupName?: string) => {
    // check exists
    if (groupName) {
        await page.goto(CLIENT_URL);
        await expect(page).toHaveURL(/.{0,30}dashboard/);
        await page.getByText('User Groups', { exact: true }).click();
        await page.getByRole('link', { name: 'unordered-list User Group List' }).click();
        await page.locator('//div[@aria-label="Page Size"]').click();
        await page.getByText("100 / page").click();
        const exists = (await page.getByRole('cell', { name: groupName }).count()) > 0;
        if (exists) {
            console.log("user group already exists!");
            return { userGroupName: groupName, existed: true };
        }
    }

    await page.goto(CLIENT_URL);
    await expect(page).toHaveURL(/.{0,30}dashboard/);

    // create usergroup
    const userGroupName = groupName ?? faker.random.word();
    await page.getByText('User Groups', { exact: true }).click();
    await page.getByRole('link', { name: 'usergroup-add Create User' }).click();
    await page.getByLabel("Group Name").fill(userGroupName);
    await page
        .getByRole("listitem")
        .filter({ hasText: "mission create" })
        .getByLabel("")
        .check();
    await page
        .getByRole("listitem")
        .filter({ hasText: "mission delete" })
        .getByLabel("")
        .check();
    await page.getByRole("button", { name: "right" }).click();
    await page.getByRole("button", { name: "Create Group" }).click();
    const usergroupCreateAlert = page.getByText("User Group created sucessfully");
    expect(usergroupCreateAlert).toBeDefined();

    return { userGroupName, existed: false };
}

export const deleteUserGroup = async (page: Page, groupName: string) => {
    await page.goto(CLIENT_URL);
    await expect(page).toHaveURL(/.{0,30}dashboard/);

    // delete usergroup
    await page.getByText('User Groups', { exact: true }).click();
    await page.getByRole('link', { name: 'unordered-list User Group List' }).click();
    await page.locator('//div[@aria-label="Page Size"]').click();
    await page.getByText("100 / page").click();
    await page
        .getByRole("row", { name: `${groupName} edit eye details delete` })
        .getByRole("button", { name: "delete" })
        .click();
    await page.getByRole("button", { name: "OK" }).click();
    const usergroupDeleteAlert = page.getByText(
        "User Group deleted successfully!"
    );
    expect(usergroupDeleteAlert).toBeDefined();
}
