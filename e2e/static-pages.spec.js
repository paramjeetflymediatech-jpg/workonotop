// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Static Pages', () => {

    test('should load About page', async ({ page }) => {
        await page.goto('/about');
        await expect(page.locator('body')).toBeVisible();
        await expect(page).toHaveURL(/\/about/);
    });

    test('should load Contact page', async ({ page }) => {
        await page.goto('/contact');
        await expect(page.locator('body')).toBeVisible();
        await expect(page).toHaveURL(/\/contact/);
    });

    test('should load FAQ page', async ({ page }) => {
        await page.goto('/faq');
        await expect(page.locator('body')).toBeVisible();
    });

    test('should load How It Works page', async ({ page }) => {
        await page.goto('/how-it-works');
        await expect(page.locator('body')).toBeVisible();
    });

    test('should load Privacy Policy page', async ({ page }) => {
        await page.goto('/privacy');
        await expect(page.locator('body')).toBeVisible();
    });

    test('should load Terms page', async ({ page }) => {
        await page.goto('/terms');
        await expect(page.locator('body')).toBeVisible();
    });

    test('should load Guarantee page', async ({ page }) => {
        await page.goto('/guarantee');
        await expect(page.locator('body')).toBeVisible();
    });

    test('should load Help/Support page', async ({ page }) => {
        await page.goto('/help');
        await expect(page.locator('body')).toBeVisible();
    });

    test('should show 404 for non-existent page', async ({ page }) => {
        const response = await page.goto('/this-page-does-not-exist-xyz');

        // Should return 404 status
        expect(response?.status()).toBe(404);
    });

    test('should have proper page title on homepage', async ({ page }) => {
        await page.goto('/');

        // Page should have a title (not empty)
        const title = await page.title();
        expect(title.length).toBeGreaterThan(0);
    });
});
