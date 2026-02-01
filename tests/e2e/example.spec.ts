import { test, expect } from '@playwright/test';

test.describe('Example E2E Test', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Bookstore/);
  });
});
