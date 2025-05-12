import { faker } from "@faker-js/faker";
import { expect, Page } from "@playwright/test";
import { CLIENT_URL } from "tests/constants";

export const createManufacturer = async (page: Page) => {
    await page.goto(CLIENT_URL);
    await expect(page).toHaveURL(/.{0,30}dashboard/);
    await page.getByRole("link", { name: "Assets" }).click();

    // manufacturer creation
    const manufacturerName = faker.company.name();
    const manufacturerAddress = faker.address.streetAddress();
    const manufacturerNationality = faker.address.country();
    const contactName = faker.name.fullName();
    const contactEmail = faker.internet.email(undefined, undefined, "kesowa.com", {
        allowSpecialCharacters: false,
    });
    const contactWebsite = faker.internet.domainName();
    await page.getByRole('button', { name: 'Manufacturer plus' }).click();
    await page.getByRole('textbox', { name: 'Manufacturer Name' }).fill(manufacturerName);
    await page.getByRole('textbox', { name: 'Address' }).fill(manufacturerAddress);
    await page.getByRole('textbox', { name: 'Nationality' }).fill(manufacturerNationality);
    await page.getByRole('button', { name: 'Add Contact' }).click();
    await page.getByRole('textbox', { name: 'Contact Name' }).fill(contactName);
    await page.getByRole('textbox', { name: 'Contact Email' }).fill(contactEmail);
    await page.getByRole('textbox', { name: 'Website' }).fill(contactWebsite);
    await page.getByRole('button', { name: 'Submit' }).click();

    const manufacturerCreateAlert = page.getByText('Manufacturer Created');
    expect(manufacturerCreateAlert).toBeDefined();

    return manufacturerName;
}

export const deleteManufacturer = async (page: Page, manufacturerName: string) => {
    await page.goto(CLIENT_URL);
    await expect(page).toHaveURL(/.{0,30}dashboard/);
    await page.getByRole("link", { name: "Assets" }).click();

    // manufacturer deletion
    await page.getByRole('tab', { name: 'Manufacturers' }).click();
    await page.getByRole('cell', { name: 'MANUFACTURER', exact: true }).getByRole('button').click();
    await page.getByRole('textbox', { name: 'Search name' }).fill(manufacturerName);
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.getByRole('button', { name: 'delete' }).click();
    await page.getByRole('button', { name: 'Yes' }).click();

    const manufacturerDeleteAlert = page.getByText(`Manufacturer "${manufacturerName}" deleted`);
    expect(manufacturerDeleteAlert).toBeDefined();
}