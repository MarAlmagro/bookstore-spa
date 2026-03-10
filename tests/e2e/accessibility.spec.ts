import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { setupApiMocks } from './fixtures/api-mocks';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  test('home page should have no accessibility violations', async ({ page }) => {
    await page.goto('/books');
    await page.waitForSelector('[data-testid="catalog-book-list"]');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('login page should have no accessibility violations', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForSelector('[data-testid="auth-login-container"]');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('cart page should have no accessibility violations', async ({ page }) => {
    await page.goto('/cart');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('book detail page should have no accessibility violations', async ({ page }) => {
    await page.goto('/books/1');
    await page.waitForSelector('[data-testid="book-detail-container"]');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
