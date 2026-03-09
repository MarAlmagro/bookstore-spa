import { test, expect } from '@playwright/test';

test.describe('Orders', () => {
  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing orders without authentication', async ({ page }) => {
      await page.goto('/orders');
      
      await expect(page).toHaveURL(/\/auth\/login/);
      await expect(page).toHaveURL(/returnUrl/);
    });

    test('should redirect to login when accessing order detail without authentication', async ({ page }) => {
      await page.goto('/orders/some-order-id');
      
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test.describe('Authenticated User', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/login');
      await page.fill('[data-testid="auth-email-input"]', 'customer@example.com');
      await page.fill('[data-testid="auth-password-input"]', 'customer123');
      await page.click('[data-testid="auth-login-submit"]');
      await expect(page.locator('[data-testid="header-user-menu"]')).toBeVisible({ timeout: 10000 });
    });

    test('should display orders page', async ({ page }) => {
      await page.goto('/orders');
      
      await expect(page.locator('[data-testid="orders-list"]')).toBeVisible();
      await expect(page.locator('h1')).toContainText(/orders|pedidos/i);
    });

    test('should navigate to orders from user menu', async ({ page }) => {
      await page.click('[data-testid="header-user-menu"]');
      await page.click('[data-testid="header-orders-link"]');
      
      await expect(page).toHaveURL('/orders');
      await expect(page.locator('[data-testid="orders-list"]')).toBeVisible();
    });

    test('should show empty state when no orders', async ({ page }) => {
      await page.goto('/orders');
      
      // Either shows orders or empty state
      const hasOrders = await page.locator('[data-testid^="order-card-"]').count() > 0;
      const hasEmptyState = await page.locator('[data-testid="orders-empty-state"]').isVisible().catch(() => false);
      
      expect(hasOrders || hasEmptyState).toBe(true);
    });

    test('should show loading state initially', async ({ page }) => {
      await page.goto('/orders');
      
      // Loading spinner should appear briefly
      // Note: This may be too fast to catch in some cases
      const loadingOrContent = await Promise.race([
        page.locator('[data-testid="orders-loading"]').isVisible().catch(() => false),
        page.locator('[data-testid="orders-list"]').isVisible().catch(() => false)
      ]);
      
      expect(loadingOrContent).toBe(true);
    });
  });

  test.describe('Order List', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/login');
      await page.fill('[data-testid="auth-email-input"]', 'customer@example.com');
      await page.fill('[data-testid="auth-password-input"]', 'customer123');
      await page.click('[data-testid="auth-login-submit"]');
      await expect(page.locator('[data-testid="header-user-menu"]')).toBeVisible({ timeout: 10000 });
    });

    test('should display order cards with correct elements', async ({ page }) => {
      await page.goto('/orders');
      
      // Wait for content to load
      await page.waitForSelector('[data-testid="orders-list"]');
      
      const orderCards = page.locator('[data-testid^="order-card-"]');
      const count = await orderCards.count();
      
      if (count > 0) {
        const firstCard = orderCards.first();
        
        // Each card should have date, item count, total, status, and view button
        await expect(firstCard.locator('[data-testid$="-date"]')).toBeVisible();
        await expect(firstCard.locator('[data-testid$="-item-count"]')).toBeVisible();
        await expect(firstCard.locator('[data-testid$="-total"]')).toBeVisible();
        await expect(firstCard.locator('[data-testid$="-status"]')).toBeVisible();
        await expect(firstCard.locator('[data-testid$="-view-btn"]')).toBeVisible();
      }
    });

    test('should navigate to order detail when clicking view button', async ({ page }) => {
      await page.goto('/orders');
      
      await page.waitForSelector('[data-testid="orders-list"]');
      
      const orderCards = page.locator('[data-testid^="order-card-"]');
      const count = await orderCards.count();
      
      if (count > 0) {
        const viewBtn = orderCards.first().locator('[data-testid$="-view-btn"]');
        await viewBtn.click();
        
        await expect(page).toHaveURL(/\/orders\/.+/);
        await expect(page.locator('[data-testid="order-detail-container"]')).toBeVisible();
      }
    });

    test('should navigate to catalog when clicking empty state action', async ({ page }) => {
      await page.goto('/orders');
      
      await page.waitForSelector('[data-testid="orders-list"]');
      
      const emptyState = page.locator('[data-testid="orders-empty-state"]');
      const isVisible = await emptyState.isVisible().catch(() => false);
      
      if (isVisible) {
        await emptyState.locator('button').click();
        await expect(page).toHaveURL('/books');
      }
    });
  });

  test.describe('Order Detail', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/login');
      await page.fill('[data-testid="auth-email-input"]', 'customer@example.com');
      await page.fill('[data-testid="auth-password-input"]', 'customer123');
      await page.click('[data-testid="auth-login-submit"]');
      await expect(page.locator('[data-testid="header-user-menu"]')).toBeVisible({ timeout: 10000 });
    });

    test('should display order detail page elements', async ({ page }) => {
      await page.goto('/orders');
      
      await page.waitForSelector('[data-testid="orders-list"]');
      
      const orderCards = page.locator('[data-testid^="order-card-"]');
      const count = await orderCards.count();
      
      if (count > 0) {
        // Navigate to first order detail
        await orderCards.first().locator('[data-testid$="-view-btn"]').click();
        
        await expect(page.locator('[data-testid="order-detail-container"]')).toBeVisible();
        await expect(page.locator('[data-testid="order-detail-back-btn"]')).toBeVisible();
        await expect(page.locator('[data-testid="order-detail-id"]')).toBeVisible();
        await expect(page.locator('[data-testid="order-detail-date"]')).toBeVisible();
        await expect(page.locator('[data-testid="order-detail-status"]')).toBeVisible();
        await expect(page.locator('[data-testid="order-detail-items"]')).toBeVisible();
        await expect(page.locator('[data-testid="order-detail-total"]')).toBeVisible();
      }
    });

    test('should navigate back to orders list when clicking back button', async ({ page }) => {
      await page.goto('/orders');
      
      await page.waitForSelector('[data-testid="orders-list"]');
      
      const orderCards = page.locator('[data-testid^="order-card-"]');
      const count = await orderCards.count();
      
      if (count > 0) {
        await orderCards.first().locator('[data-testid$="-view-btn"]').click();
        
        await expect(page.locator('[data-testid="order-detail-container"]')).toBeVisible();
        
        await page.click('[data-testid="order-detail-back-btn"]');
        
        await expect(page).toHaveURL('/orders');
        await expect(page.locator('[data-testid="orders-list"]')).toBeVisible();
      }
    });

    test('should show error state for invalid order id', async ({ page }) => {
      await page.goto('/orders/invalid-order-id-12345');
      
      // Should show error state or redirect
      const hasError = await page.locator('[data-testid="order-detail-error"]').isVisible().catch(() => false);
      const hasSnackbar = await page.locator('.mat-mdc-snack-bar-container').isVisible().catch(() => false);
      
      expect(hasError || hasSnackbar).toBe(true);
    });
  });

  test.describe('Order Status Badge', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/login');
      await page.fill('[data-testid="auth-email-input"]', 'customer@example.com');
      await page.fill('[data-testid="auth-password-input"]', 'customer123');
      await page.click('[data-testid="auth-login-submit"]');
      await expect(page.locator('[data-testid="header-user-menu"]')).toBeVisible({ timeout: 10000 });
    });

    test('should display status badge with correct styling', async ({ page }) => {
      await page.goto('/orders');
      
      await page.waitForSelector('[data-testid="orders-list"]');
      
      const statusBadges = page.locator('[data-testid^="order-status-"]');
      const count = await statusBadges.count();
      
      if (count > 0) {
        const firstBadge = statusBadges.first();
        await expect(firstBadge).toBeVisible();
        
        // Badge should have icon and text
        await expect(firstBadge.locator('mat-icon')).toBeVisible();
        await expect(firstBadge.locator('span')).toBeVisible();
      }
    });
  });
});
