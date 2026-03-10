import { test, expect } from '@playwright/test';
import { setupApiMocks } from './fixtures/api-mocks';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await page.goto('/');
  });

  test.describe('Login', () => {
    test('should display login form', async ({ page }) => {
      await page.click('[data-testid="header-login-btn"]');
      await expect(page).toHaveURL('/auth/login');
      
      await expect(page.locator('[data-testid="auth-login-container"]')).toBeVisible();
      await expect(page.locator('[data-testid="auth-email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="auth-password-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="auth-login-submit"]')).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/auth/login');
      
      await page.click('[data-testid="auth-login-submit"]');
      
      // Form should be invalid, button disabled
      await expect(page.locator('[data-testid="auth-login-submit"]')).toBeDisabled();
    });

    test('should show validation error for invalid email', async ({ page }) => {
      await page.goto('/auth/login');
      
      await page.fill('[data-testid="auth-email-input"]', 'invalid-email');
      await page.fill('[data-testid="auth-password-input"]', 'password123');
      
      // Trigger validation by blurring
      await page.locator('[data-testid="auth-email-input"]').blur();
      
      await expect(page.locator('mat-error')).toBeVisible();
    });

    test('should toggle password visibility', async ({ page }) => {
      await page.goto('/auth/login');
      
      const passwordInput = page.locator('[data-testid="auth-password-input"]');
      const toggleButton = page.locator('[data-testid="auth-toggle-password"]');
      
      // Initially password type
      await expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Click toggle
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');
      
      // Click again
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should navigate to register page', async ({ page }) => {
      await page.goto('/auth/login');
      
      await page.click('[data-testid="auth-register-link"]');
      
      await expect(page).toHaveURL('/auth/register');
    });

    test('should login successfully with valid credentials', async ({ page }) => {
      await page.goto('/auth/login');
      
      await page.fill('[data-testid="auth-email-input"]', 'customer@example.com');
      await page.fill('[data-testid="auth-password-input"]', 'customer123');
      await page.click('[data-testid="auth-login-submit"]');
      
      // Wait for navigation or user menu to appear
      await expect(page.locator('[data-testid="header-user-menu"]')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('[data-testid="header-login-btn"]')).not.toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/auth/login');
      
      await page.fill('[data-testid="auth-email-input"]', 'invalid@example.com');
      await page.fill('[data-testid="auth-password-input"]', 'wrongpassword');
      await page.click('[data-testid="auth-login-submit"]');
      
      // Verify error snackbar appears
      await expect(page.locator('.mat-mdc-snack-bar-container')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Register', () => {
    test('should display register form', async ({ page }) => {
      await page.goto('/auth/register');
      
      await expect(page.locator('[data-testid="auth-register-container"]')).toBeVisible();
      await expect(page.locator('[data-testid="auth-firstname-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="auth-lastname-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="auth-email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="auth-password-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="auth-register-submit"]')).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/auth/register');
      
      // Form should be invalid, button disabled
      await expect(page.locator('[data-testid="auth-register-submit"]')).toBeDisabled();
    });

    test('should navigate to login page', async ({ page }) => {
      await page.goto('/auth/register');
      
      await page.click('[data-testid="auth-login-link"]');
      
      await expect(page).toHaveURL('/auth/login');
    });

    test('should register new user successfully', async ({ page }) => {
      await page.goto('/auth/register');
      
      const uniqueEmail = `test-${Date.now()}@example.com`;
      
      await page.fill('[data-testid="auth-firstname-input"]', 'Test');
      await page.fill('[data-testid="auth-lastname-input"]', 'User');
      await page.fill('[data-testid="auth-email-input"]', uniqueEmail);
      await page.fill('[data-testid="auth-password-input"]', 'password123');
      await page.click('[data-testid="auth-register-submit"]');
      
      // Wait for success - either snackbar or redirect
      await expect(page.locator('[data-testid="header-user-menu"]')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Logout', () => {
    test.beforeEach(async ({ page }) => {
      // Login first
      await page.goto('/auth/login');
      await page.fill('[data-testid="auth-email-input"]', 'customer@example.com');
      await page.fill('[data-testid="auth-password-input"]', 'customer123');
      await page.click('[data-testid="auth-login-submit"]');
      await expect(page.locator('[data-testid="header-user-menu"]')).toBeVisible({ timeout: 10000 });
    });

    test('should logout successfully', async ({ page }) => {
      // Open user menu
      await page.click('[data-testid="header-user-menu"]');
      
      // Click logout
      await page.click('[data-testid="header-logout-btn"]');
      
      // Verify logged out - login button should appear
      await expect(page.locator('[data-testid="header-login-btn"]')).toBeVisible();
      await expect(page.locator('[data-testid="header-user-menu"]')).not.toBeVisible();
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing protected route', async ({ page }) => {
      // Try to access orders page without being logged in
      await page.goto('/orders');
      
      // Should redirect to login with returnUrl
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test.describe('Header Auth State', () => {
    test('should show login button when not authenticated', async ({ page }) => {
      await page.goto('/');
      
      await expect(page.locator('[data-testid="header-login-btn"]')).toBeVisible();
      await expect(page.locator('[data-testid="header-user-menu"]')).not.toBeVisible();
    });

    test('should show user menu when authenticated', async ({ page }) => {
      // Login
      await page.goto('/auth/login');
      await page.fill('[data-testid="auth-email-input"]', 'customer@example.com');
      await page.fill('[data-testid="auth-password-input"]', 'customer123');
      await page.click('[data-testid="auth-login-submit"]');
      
      await expect(page.locator('[data-testid="header-user-menu"]')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('[data-testid="header-login-btn"]')).not.toBeVisible();
    });

    test('should display user name in header when authenticated', async ({ page }) => {
      // Login
      await page.goto('/auth/login');
      await page.fill('[data-testid="auth-email-input"]', 'customer@example.com');
      await page.fill('[data-testid="auth-password-input"]', 'customer123');
      await page.click('[data-testid="auth-login-submit"]');
      
      await expect(page.locator('[data-testid="header-user-menu"]')).toBeVisible({ timeout: 10000 });
      
      // User menu should contain user's first name
      const userMenu = page.locator('[data-testid="header-user-menu"]');
      await expect(userMenu.locator('.user-name')).toBeVisible();
    });
  });
});
