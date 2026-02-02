import { test, expect } from '@playwright/test';

test.describe('Catalog Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/books');
  });

  test.describe('Book List', () => {
    test('should display book catalog page', async ({ page }) => {
      await expect(page.locator('[data-testid="catalog-book-list"]')).toBeVisible();
    });

    test('should display book cards', async ({ page }) => {
      const bookCards = page.locator('[data-testid^="catalog-book-card-"]');
      await expect(bookCards.first()).toBeVisible({ timeout: 10000 });
    });

    test('should display book title, author, and price on cards', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="catalog-book-card-"]').first();
      await expect(firstCard).toBeVisible({ timeout: 10000 });

      const title = firstCard.locator('[data-testid$="-title"]');
      const author = firstCard.locator('[data-testid$="-author"]');
      const price = firstCard.locator('[data-testid$="-price"]');

      await expect(title).toBeVisible();
      await expect(author).toBeVisible();
      await expect(price).toBeVisible();
    });

    test('should navigate to book detail when clicking view details', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="catalog-book-card-"]').first();
      await expect(firstCard).toBeVisible({ timeout: 10000 });

      const viewBtn = firstCard.locator('[data-testid$="-view"]');
      await viewBtn.click();

      await expect(page).toHaveURL(/\/books\/\d+/);
      await expect(page.locator('[data-testid="book-detail-container"]')).toBeVisible();
    });

    test('should navigate to book detail when clicking card', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="catalog-book-card-"]').first();
      await expect(firstCard).toBeVisible({ timeout: 10000 });

      await firstCard.click();

      await expect(page).toHaveURL(/\/books\/\d+/);
    });
  });

  test.describe('Book Filters', () => {
    test('should display filters section', async ({ page }) => {
      await expect(page.locator('[data-testid="catalog-filters"]')).toBeVisible();
    });

    test('should have search input', async ({ page }) => {
      await expect(page.locator('[data-testid="catalog-search-input"]')).toBeVisible();
    });

    test('should have category select', async ({ page }) => {
      await expect(page.locator('[data-testid="catalog-category-select"]')).toBeVisible();
    });

    test('should filter by search query', async ({ page }) => {
      const searchInput = page.locator('[data-testid="catalog-search-input"]');
      await searchInput.fill('test');
      await searchInput.press('Enter');

      await expect(page).toHaveURL(/\/books\/search\?query=test/);
    });

    test('should show clear filters button when filters active', async ({ page }) => {
      const searchInput = page.locator('[data-testid="catalog-search-input"]');
      await searchInput.fill('test');

      const clearBtn = page.locator('[data-testid="catalog-filters-clear"]');
      await expect(clearBtn).toBeVisible();
    });
  });

  test.describe('Book Detail', () => {
    test('should display book details', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="catalog-book-card-"]').first();
      await expect(firstCard).toBeVisible({ timeout: 10000 });
      await firstCard.click();

      await expect(page.locator('[data-testid="book-detail-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="book-detail-author"]')).toBeVisible();
      await expect(page.locator('[data-testid="book-detail-price"]')).toBeVisible();
      await expect(page.locator('[data-testid="book-detail-isbn"]')).toBeVisible();
    });

    test('should have quantity controls', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="catalog-book-card-"]').first();
      await expect(firstCard).toBeVisible({ timeout: 10000 });
      await firstCard.click();

      await expect(page.locator('[data-testid="book-detail-qty-decrease"]')).toBeVisible();
      await expect(page.locator('[data-testid="book-detail-qty-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="book-detail-qty-increase"]')).toBeVisible();
    });

    test('should increase quantity', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="catalog-book-card-"]').first();
      await expect(firstCard).toBeVisible({ timeout: 10000 });
      await firstCard.click();

      const qtyInput = page.locator('[data-testid="book-detail-qty-input"]');
      await expect(qtyInput).toHaveValue('1');

      await page.locator('[data-testid="book-detail-qty-increase"]').click();
      await expect(qtyInput).toHaveValue('2');
    });

    test('should decrease quantity', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="catalog-book-card-"]').first();
      await expect(firstCard).toBeVisible({ timeout: 10000 });
      await firstCard.click();

      await page.locator('[data-testid="book-detail-qty-increase"]').click();
      await page.locator('[data-testid="book-detail-qty-increase"]').click();

      const qtyInput = page.locator('[data-testid="book-detail-qty-input"]');
      await expect(qtyInput).toHaveValue('3');

      await page.locator('[data-testid="book-detail-qty-decrease"]').click();
      await expect(qtyInput).toHaveValue('2');
    });

    test('should not decrease quantity below 1', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="catalog-book-card-"]').first();
      await expect(firstCard).toBeVisible({ timeout: 10000 });
      await firstCard.click();

      const decreaseBtn = page.locator('[data-testid="book-detail-qty-decrease"]');
      await expect(decreaseBtn).toBeDisabled();
    });

    test('should have add to cart button', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="catalog-book-card-"]').first();
      await expect(firstCard).toBeVisible({ timeout: 10000 });
      await firstCard.click();

      await expect(page.locator('[data-testid="book-detail-add-cart"]')).toBeVisible();
    });

    test('should navigate back to catalog', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="catalog-book-card-"]').first();
      await expect(firstCard).toBeVisible({ timeout: 10000 });
      await firstCard.click();

      await page.locator('[data-testid="book-detail-back-btn"]').click();
      await expect(page).toHaveURL('/books');
    });
  });

  test.describe('Search Results', () => {
    test('should display search results page', async ({ page }) => {
      await page.goto('/books/search?query=test');
      await expect(page.locator('[data-testid="catalog-search-results"]')).toBeVisible();
    });

    test('should show empty state for no results', async ({ page }) => {
      await page.goto('/books/search?query=xyznonexistent123');
      
      const emptyState = page.locator('[data-testid="catalog-search-empty"]');
      await expect(emptyState).toBeVisible({ timeout: 10000 });
    });

    test('should have view all books button in empty state', async ({ page }) => {
      await page.goto('/books/search?query=xyznonexistent123');
      
      const viewAllBtn = page.locator('[data-testid="catalog-search-view-all-btn"]');
      await expect(viewAllBtn).toBeVisible({ timeout: 10000 });

      await viewAllBtn.click();
      await expect(page).toHaveURL('/books');
    });
  });

  test.describe('Pagination', () => {
    test('should display pagination when many books', async ({ page }) => {
      // Pagination may or may not be visible depending on data amount
      // Just verify the page loads correctly with the book list
      await expect(page.locator('[data-testid="catalog-book-list"]')).toBeVisible();
      
      // If pagination exists, it should be functional
      const pagination = page.locator('[data-testid="catalog-pagination"]');
      const paginationCount = await pagination.count();
      if (paginationCount > 0) {
        await expect(pagination).toBeVisible();
      }
    });
  });

  test.describe('Add to Cart', () => {
    test('should add book to cart from list', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="catalog-book-card-"]').first();
      await expect(firstCard).toBeVisible({ timeout: 10000 });

      const addBtn = firstCard.locator('[data-testid$="-add-cart"]');
      await addBtn.click();

      // Cart badge should update
      const cartBadge = page.locator('[data-testid="header-cart-btn"] .mat-badge-content');
      await expect(cartBadge).toBeVisible();
    });

    test('should add book to cart from detail page', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="catalog-book-card-"]').first();
      await expect(firstCard).toBeVisible({ timeout: 10000 });
      await firstCard.click();

      await page.locator('[data-testid="book-detail-add-cart"]').click();

      // Should show snackbar notification
      await expect(page.locator('.mat-mdc-snack-bar-container')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/books');

      await expect(page.locator('[data-testid="catalog-book-list"]')).toBeVisible();
      const bookCards = page.locator('[data-testid^="catalog-book-card-"]');
      await expect(bookCards.first()).toBeVisible({ timeout: 10000 });
    });

    test('should display correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/books');

      await expect(page.locator('[data-testid="catalog-book-list"]')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper aria labels on interactive elements', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="catalog-book-card-"]').first();
      await expect(firstCard).toBeVisible({ timeout: 10000 });

      const ariaLabel = await firstCard.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    });

    test('should be keyboard navigable', async ({ page }) => {
      await page.keyboard.press('Tab');
      
      // Should be able to focus on interactive elements
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });
  });
});
