import { test, expect } from '@playwright/test';

test('loggged-in-successful', { tag: ['@smoke', '@user-login'] }, async ({ page }) => {
    // 1. Go to the dashboard (since storageState is injected, it should be logged in)
    const baseUrl = process.env.BASE_URL || process.env.E2E_BASE_URL;
    const slug = process.env.E2E_SLUG;
    await page.goto(`${baseUrl}/${slug}/app/custom-dashboard`);

    // 2. Verify that we are on the dashboard page and not redirected to login
    await expect(page).toHaveURL(/.*\/app\/custom-dashboard/);
    await expect(page).not.toHaveURL(/.*\/login/);

    // 3. Verify the page has loaded (waiting for some generic app/dashboard content)
    // Adjust this to look for a specific element on your dashboard if needed
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
}); 