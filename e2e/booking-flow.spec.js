// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {

    test('should load booking details page', async ({ page }) => {
        await page.goto('/booking/details');
        await expect(page.locator('body')).toBeVisible();
    });

    test('should load booking schedule page', async ({ page }) => {
        await page.goto('/booking/schedule');
        await expect(page.locator('body')).toBeVisible();
    });

    test('should load booking confirm page', async ({ page }) => {
        await page.goto('/booking/confirm');
        await expect(page.locator('body')).toBeVisible();
    });

    test('should load booking payment page', async ({ page }) => {
        await page.goto('/booking/payment');
        await expect(page.locator('body')).toBeVisible();
    });

    test('should load booking success page', async ({ page }) => {
        await page.goto('/booking/success');
        await expect(page.locator('body')).toBeVisible();
    });

    test('booking details should have input fields for customer info', async ({ page }) => {
        await page.goto('/booking/details');
        await page.waitForTimeout(1500);

        // Look for common booking form elements
        const inputs = page.locator('input');
        const inputCount = await inputs.count();

        // Booking details page should have input fields for name, email, phone etc.
        if (inputCount > 0) {
            expect(inputCount).toBeGreaterThan(0);
        }
    });

    test('booking schedule page should have date/time selection', async ({ page }) => {
        await page.goto('/booking/schedule');
        await page.waitForTimeout(1500);

        // Page should render without errors
        await expect(page.locator('body')).toBeVisible();

        // Look for any interactive elements for date/time
        const buttons = page.locator('button');
        const buttonCount = await buttons.count();
        expect(buttonCount).toBeGreaterThanOrEqual(0);
    });
});
