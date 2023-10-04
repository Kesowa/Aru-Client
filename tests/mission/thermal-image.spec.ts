import { test } from "@playwright/test";
import { CLIENT_URL } from "tests/constants";

test("thermal image tests", async({page}) => {
    await page.goto(CLIENT_URL);
    await page.getByRole('menuitem', { name: 'border-inner Missions' }).getByRole('link', { name: 'border-inner Missions' }).click();
    await page.getByRole('heading', { name: 'Rust Nature Sanctuary' }).click();
    await page.getByText('Images').click();
    await page.locator('span:nth-child(2) > .ant-badge > .ant-image > .ant-image-mask').click({
      button: 'right'
    });
    await page.getByText('Thermal View').click();
    
    const modalElement = await page.locator('#canvas');

    await modalElement.hover();
    await page.waitForTimeout(2500);
    await page.getByRole('button', { name: 'Close' }).click();
})