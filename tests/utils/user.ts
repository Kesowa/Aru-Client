import { faker } from "@faker-js/faker";
import { expect, Page } from "@playwright/test";
import { CLIENT_URL } from "tests/constants";
import { createUserGroup, deleteUserGroup } from "./usergroup";

export const createUser = async (page: Page, groupName?: string) => {
    let res: { userGroupName: string, existed: boolean };
    if (groupName) {
        res = await createUserGroup(page, groupName);
    } else {
        res = await createUserGroup(page);
    }
    
    const { userGroupName, existed } = res;

    await page.goto(CLIENT_URL);
    await expect(page).toHaveURL(/.{0,30}dashboard/);

    // create user
    const userName = faker.name.fullName();
    const userEmail = faker.internet.email(undefined, undefined, "kesowa.com", {
        allowSpecialCharacters: false,
    });
    const userPhone = faker.phone.number();
    page.on("filechooser", (fileChooser) => {
        fileChooser.setFiles(["tests/assets/image.png"]);
    });
    
    await page.getByText('User', { exact: true }).click();
    await page.getByRole('link', { name: 'plus-circle Create User' }).click();

    await page.getByRole('textbox', { name: '* Name' }).fill(userName);
    await page.getByRole('combobox', { name: '* User Group' }).click();
    await page.getByText(userGroupName, { exact: true }).click();
    await page.getByRole('textbox', { name: '* Phone Number' }).fill(userPhone);
    await page.getByRole('textbox', { name: '* Email Id' }).fill(userEmail);
    await page.getByRole('button', { name: 'plus Upload' }).click();
    await page.getByRole('button', { name: 'OK' }).click();
    await page.getByRole('button', { name: 'Create' }).click();

    const userCreateAlert = page.getByText(
        "User created! Check email to change password"
    );
    expect(userCreateAlert).toBeDefined();

    // verify listing
    await page.getByRole('button', { name: 'plus-circle List User' }).click();
    await page.getByRole('cell', { name: 'Email Id search' }).getByRole('button').click();
    await page.getByRole('textbox', { name: 'Search email' }).fill(userEmail);
    await page.getByRole('button', { name: 'Search', exact: true }).click();

    const userFound = page.getByRole('cell', { name: userEmail });
    expect(userFound).toBeDefined();

    return { userName, userEmail, userPhone, userGroupName, userGroupExisted: existed };
}

export const deleteUser = async (page: Page, userEmail: string, userGroup?: string) => {
    await page.goto(CLIENT_URL);
    await expect(page).toHaveURL(/.{0,30}dashboard/);

    // find user
    await page.getByText('User', { exact: true }).click();
    await page.getByRole('link', { name: 'unordered-list User List' }).click();
    await page.getByRole('cell', { name: 'Email Id search' }).getByRole('button').click();
    await page.getByRole('textbox', { name: 'Search email' }).fill(userEmail);
    await page.getByRole('button', { name: 'Search', exact: true }).click();

    // delete user
    await page.getByRole('button', { name: 'delete' }).click();
    await page.getByRole('button', { name: 'Yes' }).click();

    const userDeleteAlert = page.getByText(
        "User deleted successfully!"
    );
    expect(userDeleteAlert).toBeDefined();

    if (userGroup) {
        await deleteUserGroup(page, userGroup);
    }
}