import { test, expect } from '@playwright/test';
import { setupApiMocks } from './fixtures/api-mocks';

test.describe('Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  test('book catalog matches snapshot', async ({ page }) => {
    await page.goto('/books');
    await page.waitForSelector('[data-testid="catalog-book-list"]');
    await expect(page).toHaveScreenshot('catalog.png');
  });

  test('login page matches snapshot', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForSelector('[data-testid="auth-login-container"]');
    await expect(page).toHaveScreenshot('login.png');
  });

  test('cart empty state matches snapshot', async ({ page }) => {
    await page.goto('/cart');
    await expect(page).toHaveScreenshot('cart-empty.png');
  });
});
