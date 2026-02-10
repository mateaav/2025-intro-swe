import { expect, test } from '@playwright/test';

test('root page redirect to login page', async ({ page }) => {
	await page.goto('/');
	await page.waitForURL('/login');
	await expect(page.url()).toMatch(/\/login$/);
});

test('login page', async ({ page }) => {
	await page.goto('/login', { waitUntil: 'domcontentloaded' });
	await expect(page.locator('h1')).toContainText('Login');
});
