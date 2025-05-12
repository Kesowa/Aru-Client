import { faker } from "@faker-js/faker";
import { expect, Page } from "@playwright/test";
import { CLIENT_URL } from "tests/constants";

export const createModel = async (page: Page, manufacturerName: string) => {
    await page.goto(CLIENT_URL);
    await expect(page).toHaveURL(/.{0,30}dashboard/);
    await page.getByRole("link", { name: "Assets" }).click();

    // model creation
    const modelName = faker.random.words(2);
    const modelNumber = faker.random.numeric(6);
    const modelWebsite = faker.internet.domainName();
    await page.getByRole('button', { name: 'Model plus' }).click();
    await page.getByRole('textbox', { name: 'Model Name' }).fill(modelName);
    await page.getByRole('textbox', { name: 'Model Number' }).fill(modelNumber);
    await page.getByRole('combobox', { name: 'Asset Class' }).click();
    await page.getByTitle('drone').click(); // TODO: Asset class tests, requires super-admin login, not yet implemented
    await page.getByRole('combobox', { name: 'Manufacturer' }).click();
    await page.getByText(manufacturerName).click();
    await page.getByPlaceholder('Length').fill(faker.random.numeric(2));
    await page.getByPlaceholder('Breadth').fill(faker.random.numeric(2));
    await page.getByPlaceholder('Height').fill(faker.random.numeric(2));
    await page.getByRole('textbox', { name: 'Website' }).fill(modelWebsite);
    await page.getByRole('button', { name: 'Submit' }).click();

    const modelCreateAlert = page.getByText('Model Created Successfully');
    expect(modelCreateAlert).toBeDefined();

    return modelName;
}

export const deleteModel = async (page: Page, modelName: string) => {
    await page.goto(CLIENT_URL);
    await expect(page).toHaveURL(/.{0,30}dashboard/);
    await page.getByRole("link", { name: "Assets" }).click();

    // model deletion
    await page.getByRole('tab', { name: 'Models' }).click();
    await page.getByLabel('NAME', { exact: true }).getByRole('button', { name: 'search' }).click();
    await page.getByRole('textbox', { name: 'Search modelName' }).fill(modelName);
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.getByRole('button', { name: 'delete' }).click();
    await page.getByRole('button', { name: 'Yes' }).click();
    await page.getByText('Model deleted').click();

    const modelDeleteAlert = page.getByText(`Model deleted`);
    expect(modelDeleteAlert).toBeDefined();
}