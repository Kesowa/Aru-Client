import { faker } from "@faker-js/faker";
import { expect, Page } from "@playwright/test";
import { CLIENT_URL } from "tests/constants";

export const createAsset = async (page: Page, manufacturerName: string, modelName: string, ownerName: string) => {
    await page.goto(CLIENT_URL);
    await expect(page).toHaveURL(/.{0,30}dashboard/);
    await page.getByRole("link", { name: "Assets" }).click();

    // asset creation
    const assetName = faker.random.word() + " drone";
    await page.getByRole('button', { name: 'Asset plus' }).click();
    await page.getByRole('textbox', { name: 'Asset Name' }).fill(assetName);
    await page.getByRole('combobox', { name: 'Asset Type' }).click();
    await page.getByText(manufacturerName).click();
    await page.getByText(modelName).click();
    await page.getByRole('combobox', { name: 'Asset Owner' }).click();
    await page.getByTitle(ownerName).locator('div').click();

    await page.getByRole('row', { name: 'UIN edit delete' }).locator('a').first().click();
    await page.locator('#create_mission_value').fill(faker.random.numeric(6));
    await page.getByRole('link', { name: 'save' }).click();

    await page.getByRole('row', { name: 'FCID edit delete' }).locator('a').first().click();
    await page.locator('#create_mission_value').fill(faker.random.numeric(6));
    await page.getByRole('link', { name: 'save' }).click();

    await page.getByRole('row', { name: 'serialNo edit delete' }).locator('a').first().click();
    await page.locator('#create_mission_value').fill(faker.random.numeric(6));
    await page.getByRole('link', { name: 'save' }).click();

    await page.getByRole('textbox', { name: 'Select date' }).click();
    await page.getByText('Now').click();

    await page.getByRole('button', { name: 'Submit' }).click();

    const assetCreateAlert = page.getByText("Asset Created Successfully");
    expect(assetCreateAlert).toBeDefined();

    return assetName;
}

export const deleteAsset = async (page: Page, assetName: string) => {
    await page.goto(CLIENT_URL);
    await expect(page).toHaveURL(/.{0,30}dashboard/);
    await page.getByRole("link", { name: "Assets" }).click();

    // asset deletion
    await page.getByLabel('ASSET', { exact: true }).getByRole('button', { name: 'search' }).click();
    await page.getByRole('textbox', { name: 'Search assetName' }).fill(assetName);
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.getByRole('button', { name: 'ellipsis' }).click();
    await page.getByText('Delete Asset').click();
    await page.getByRole('button', { name: 'Yes' }).click();
    
    const assetDeleteAlert = page.getByText(`Asset ${assetName} deleted`);
    expect(assetDeleteAlert).toBeDefined();
}