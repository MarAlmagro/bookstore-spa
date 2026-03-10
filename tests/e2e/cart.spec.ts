import { test, expect } from '@playwright/test';
import { setupApiMocks } from './fixtures/api-mocks';

test.describe('Cart Feature', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test.describe('Empty Cart', () => {
    test('should display empty cart state', async ({ page }) => {
      await page.goto('/cart');
      
      await expect(page.locator('[data-testid="cart-view"]')).toBeVisible();
      await expect(page.locator('[data-testid="cart-empty-state"]')).toBeVisible();
    });

    test('should navigate to catalog from empty cart', async ({ page }) => {
      await page.goto('/cart');
      
      const browseBtn = page.locator('[data-testid="cart-empty-state"] button');
      await expect(browseBtn).toBeVisible();
      await browseBtn.click();
      
      await expect(page).toHaveURL('/books');
    });
  });

  test.describe('Cart with Items', () => {
    test.beforeEach(async ({ page }) => {
      await setupApiMocks(page);
      // Add a book to cart first
      await page.goto('/books');
      const firstCard = page.locator('[data-testid^="catalog-book-card-"]').first();
      await expect(firstCard).toBeVisible({ timeout: 10000 });
      
      const addBtn = firstCard.locator('[data-testid$="-add-cart"]');
      await addBtn.click();
      
      // Wait for cart to update
      await page.waitForTimeout(500);
    });

    test('should display cart items', async ({ page }) => {
      await page.goto('/cart');
      
      await expect(page.locator('[data-testid="cart-view"]')).toBeVisible();
      const cartItems = page.locator('[data-testid^="cart-item-"]');
      await expect(cartItems.first()).toBeVisible();
    });

    test('should display cart summary', async ({ page }) => {
      await page.goto('/cart');
      
      await expect(page.locator('[data-testid="cart-summary-container"]')).toBeVisible();
      await expect(page.locator('[data-testid="cart-summary-subtotal"]')).toBeVisible();
      await expect(page.locator('[data-testid="cart-summary-total"]')).toBeVisible();
    });

    test('should increase item quantity', async ({ page }) => {
      await page.goto('/cart');
      
      const cartItem = page.locator('[data-testid^="cart-item-"]').first();
      await expect(cartItem).toBeVisible();
      
      const increaseBtn = cartItem.locator('[data-testid$="-qty-increase"]');
      const qtyDisplay = cartItem.locator('[data-testid$="-qty-input"]');
      
      const initialQty = await qtyDisplay.textContent();
      await increaseBtn.click();
      
      await expect(qtyDisplay).not.toHaveText(initialQty!);
    });

    test('should decrease item quantity', async ({ page }) => {
      await page.goto('/cart');
      
      // First increase to 2
      const cartItem = page.locator('[data-testid^="cart-item-"]').first();
      await expect(cartItem).toBeVisible();
      
      const increaseBtn = cartItem.locator('[data-testid$="-qty-increase"]');
      await increaseBtn.click();
      
      const decreaseBtn = cartItem.locator('[data-testid$="-qty-decrease"]');
      const qtyDisplay = cartItem.locator('[data-testid$="-qty-input"]');
      
      await expect(qtyDisplay).toHaveText('2');
      await decreaseBtn.click();
      await expect(qtyDisplay).toHaveText('1');
    });

    test('should remove item from cart', async ({ page }) => {
      await page.goto('/cart');
      
      const cartItem = page.locator('[data-testid^="cart-item-"]').first();
      await expect(cartItem).toBeVisible();
      
      const removeBtn = cartItem.locator('[data-testid$="-remove"]');
      await removeBtn.click();
      
      // Cart should be empty now
      await expect(page.locator('[data-testid="cart-empty-state"]')).toBeVisible();
    });

    test('should update header cart badge', async ({ page }) => {
      const cartBadge = page.locator('[data-testid="header-cart-btn"] .mat-badge-content');
      await expect(cartBadge).toBeVisible();
      await expect(cartBadge).toHaveText('1');
    });

    test('should navigate to checkout', async ({ page }) => {
      await page.goto('/cart');
      
      const checkoutBtn = page.locator('[data-testid="cart-summary-checkout-btn"]');
      await expect(checkoutBtn).toBeVisible();
      await checkoutBtn.click();
      
      // Should redirect to login if not authenticated
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test.describe('Checkout Flow', () => {
    test.beforeEach(async ({ page }) => {
      await setupApiMocks(page);
      // Login first
      await page.goto('/auth/login');
      await page.fill('[data-testid="auth-email-input"]', 'customer@example.com');
      await page.fill('[data-testid="auth-password-input"]', 'customer123');
      await page.click('[data-testid="auth-login-submit"]');
      
      // Wait for login to complete
      await expect(page.locator('[data-testid="header-user-menu"]')).toBeVisible({ timeout: 10000 });
      
      // Add a book to cart
      await page.goto('/books');
      const firstCard = page.locator('[data-testid^="catalog-book-card-"]').first();
      await expect(firstCard).toBeVisible({ timeout: 10000 });
      
      const addBtn = firstCard.locator('[data-testid$="-add-cart"]');
      await addBtn.click();
      await page.waitForTimeout(500);
    });

    test('should display checkout page', async ({ page }) => {
      await page.goto('/cart/checkout');
      
      await expect(page.locator('[data-testid="checkout-view"]')).toBeVisible();
      await expect(page.locator('[data-testid="checkout-item-list"]')).toBeVisible();
      await expect(page.locator('[data-testid="checkout-total"]')).toBeVisible();
    });

    test('should have confirm order button', async ({ page }) => {
      await page.goto('/cart/checkout');
      
      await expect(page.locator('[data-testid="checkout-confirm-btn"]')).toBeVisible();
    });

    test('should navigate back to cart', async ({ page }) => {
      await page.goto('/cart/checkout');
      
      const backBtn = page.locator('[data-testid="checkout-back-btn"]');
      await expect(backBtn).toBeVisible();
      await backBtn.click();
      
      await expect(page).toHaveURL('/cart');
    });

    test('should redirect to cart if cart is empty', async ({ page }) => {
      // Clear cart
      await page.evaluate(() => localStorage.removeItem('bookstore_cart'));
      
      await page.goto('/cart/checkout');
      
      // Should redirect to cart
      await expect(page).toHaveURL('/cart');
    });
  });

  test.describe('Cart Persistence', () => {
    test('should persist cart across page reloads', async ({ page }) => {
      // Add item to cart
      await page.goto('/books');
      const firstCard = page.locator('[data-testid^="catalog-book-card-"]').first();
      await expect(firstCard).toBeVisible({ timeout: 10000 });
      
      const addBtn = firstCard.locator('[data-testid$="-add-cart"]');
      await addBtn.click();
      await page.waitForTimeout(500);
      
      // Reload page
      await page.reload();
      
      // Cart badge should still show item
      const cartBadge = page.locator('[data-testid="header-cart-btn"] .mat-badge-content');
      await expect(cartBadge).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test.beforeEach(async ({ page }) => {
      await setupApiMocks(page);
      // Add item to cart
      await page.goto('/books');
      const firstCard = page.locator('[data-testid^="catalog-book-card-"]').first();
      await expect(firstCard).toBeVisible({ timeout: 10000 });
      
      const addBtn = firstCard.locator('[data-testid$="-add-cart"]');
      await addBtn.click();
      await page.waitForTimeout(500);
    });

    test('should display correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/cart');
      
      await expect(page.locator('[data-testid="cart-view"]')).toBeVisible();
      await expect(page.locator('[data-testid^="cart-item-"]').first()).toBeVisible();
    });

    test('should display correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/cart');
      
      await expect(page.locator('[data-testid="cart-view"]')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await setupApiMocks(page);
      // Add item to cart
      await page.goto('/books');
      const firstCard = page.locator('[data-testid^="catalog-book-card-"]').first();
      await expect(firstCard).toBeVisible({ timeout: 10000 });
      
      const addBtn = firstCard.locator('[data-testid$="-add-cart"]');
      await addBtn.click();
      await page.waitForTimeout(500);
    });

    test('should have aria labels on quantity buttons', async ({ page }) => {
      await page.goto('/cart');
      
      const cartItem = page.locator('[data-testid^="cart-item-"]').first();
      await expect(cartItem).toBeVisible();
      
      const decreaseBtn = cartItem.locator('[data-testid$="-qty-decrease"]');
      const increaseBtn = cartItem.locator('[data-testid$="-qty-increase"]');
      const removeBtn = cartItem.locator('[data-testid$="-remove"]');
      
      await expect(decreaseBtn).toHaveAttribute('aria-label');
      await expect(increaseBtn).toHaveAttribute('aria-label');
      await expect(removeBtn).toHaveAttribute('aria-label');
    });

    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/cart');
      
      await page.keyboard.press('Tab');
      
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });
  });
});
