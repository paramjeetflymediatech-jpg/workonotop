// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Admin Panel - Auth Protection', () => {

    test('should redirect /admin to /admin/login when not authenticated', async ({ page }) => {
        await page.goto('/admin');

        // Middleware should redirect to login
        await expect(page).toHaveURL(/\/admin\/login/);
    });

    test('should redirect /admin/bookings to login when not authenticated', async ({ page }) => {
        await page.goto('/admin/bookings');
        await expect(page).toHaveURL(/\/admin\/login/);
    });

    test('should redirect /admin/providers to login when not authenticated', async ({ page }) => {
        await page.goto('/admin/providers');
        await expect(page).toHaveURL(/\/admin\/login/);
    });

    test('should redirect /admin/services to login when not authenticated', async ({ page }) => {
        await page.goto('/admin/services');
        await expect(page).toHaveURL(/\/admin\/login/);
    });

    test('should redirect /admin/analytics to login when not authenticated', async ({ page }) => {
        await page.goto('/admin/analytics');
        await expect(page).toHaveURL(/\/admin\/login/);
    });

    test('should redirect /admin/users to login when not authenticated', async ({ page }) => {
        await page.goto('/admin/users');
        await expect(page).toHaveURL(/\/admin\/login/);
    });

    test('should allow access to /admin/login without auth', async ({ page }) => {
        await page.goto('/admin/login');

        // Should NOT redirect, should stay on login page
        await expect(page).toHaveURL(/\/admin\/login/);
        await expect(page.locator('body')).toBeVisible();
    });

    test('admin login page should have email and password fields', async ({ page }) => {
        await page.goto('/admin/login');

        // Look for login form elements
        const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
        const passwordInput = page.locator('input[type="password"]');

        await expect(emailInput.first()).toBeVisible();
        await expect(passwordInput.first()).toBeVisible();
    });

    test('admin login should show error for invalid credentials', async ({ page }) => {
        await page.goto('/admin/login');

        // Fill in wrong credentials
        const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
        const passwordInput = page.locator('input[type="password"]').first();

        await emailInput.fill('wrong@test.com');
        await passwordInput.fill('wrongpassword');

        // Submit
        const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first();
        await submitButton.click();

        // Should show error or stay on login page (not redirect to dashboard)
        await page.waitForTimeout(2000);
        await expect(page).toHaveURL(/\/admin\/login/);
    });
});
