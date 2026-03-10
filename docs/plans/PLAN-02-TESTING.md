# Plan 02: Testing Improvements

**Priority**: High 🟠  
**Estimated Effort**: 6-8 hours  
**Dependencies**: None

---

## Objective

Implement E2E mock strategy to enable tests without backend, add accessibility testing, and improve test reliability.

---

## Tasks

### 1. Create E2E Test Environment with Mocks

Create `src/environments/environment.e2e.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: '/api/v1',
  apiGateway: 'http://localhost:8080',
  defaultLanguage: 'en',
  useMocks: true  // Enable mocks for E2E
};
```

Update `angular.json` to add e2e configuration:

```json
{
  "configurations": {
    "e2e": {
      "fileReplacements": [
        {
          "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.e2e.ts"
        }
      ]
    }
  }
}
```

Update `package.json` scripts:

```json
{
  "scripts": {
    "start:e2e": "ng serve --configuration e2e",
    "e2e": "npm run start:e2e & wait-on http://localhost:4200 && playwright test"
  }
}
```

Install wait-on:

```bash
npm install --save-dev wait-on
```

### 2. Alternative: Playwright Network Interception

Create `tests/e2e/fixtures/api-mocks.ts`:

```typescript
import { Page } from '@playwright/test';

export const mockBooks = [
  {
    id: 1,
    isbn: '9780134685991',
    title: 'Effective Java',
    author: 'Joshua Bloch',
    description: 'The definitive guide to Java best practices',
    price: 45.99,
    stock: 50,
    category: 'Programming'
  },
  {
    id: 2,
    isbn: '9780596517748',
    title: 'JavaScript: The Good Parts',
    author: 'Douglas Crockford',
    description: 'Unearthing the excellence in JavaScript',
    price: 29.99,
    stock: 30,
    category: 'Programming'
  }
];

export const mockAuthResponse = {
  token: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  user: {
    id: 1,
    email: 'customer@example.com',
    firstName: 'Test',
    lastName: 'Customer',
    role: 'CUSTOMER'
  }
};

export async function setupApiMocks(page: Page) {
  await page.route('**/api/v1/books/page**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        content: mockBooks,
        page: 0,
        size: 20,
        totalElements: mockBooks.length,
        totalPages: 1,
        first: true,
        last: true
      })
    });
  });

  await page.route('**/api/v1/books', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBooks)
      });
    }
  });

  await page.route('**/api/v1/books/*', async (route) => {
    const url = route.request().url();
    const idMatch = url.match(/\/books\/(\d+)/);
    if (idMatch) {
      const id = parseInt(idMatch[1]);
      const book = mockBooks.find(b => b.id === id) || mockBooks[0];
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(book)
      });
    }
  });

  await page.route('**/api/v1/auth/login', async (route) => {
    const body = route.request().postDataJSON();
    if (body?.email === 'customer@example.com' && body?.password === 'customer123') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAuthResponse)
      });
    } else {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials' })
      });
    }
  });

  await page.route('**/api/v1/auth/register', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockAuthResponse)
    });
  });

  await page.route('**/api/v1/orders', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'mock-order-' + Date.now(),
          userId: 1,
          items: [],
          totalAmount: 75.98,
          status: 'PENDING',
          createdAt: new Date().toISOString()
        })
      });
    }
  });

  await page.route('**/api/v1/orders/user/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([])
    });
  });
}
```

Update `tests/e2e/auth.spec.ts` to use mocks:

```typescript
import { test, expect } from '@playwright/test';
import { setupApiMocks } from './fixtures/api-mocks';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await page.goto('/');
  });

  // ... existing tests
});
```

### 3. Add Accessibility Testing with axe-core

Install axe-core:

```bash
npm install --save-dev @axe-core/playwright
```

Create `tests/e2e/accessibility.spec.ts`:

```typescript
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
```

### 4. Add Visual Regression Testing

Update `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
    },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
  },
});
```

Create `tests/e2e/visual.spec.ts`:

```typescript
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
```

### 5. Improve Unit Test Coverage

Add missing test cases for edge cases:

**`header.component.spec.ts`** - Add fallback language test:

```typescript
it('should use fallback language when current lang is undefined', () => {
  translateService.getCurrentLang.mockReturnValue(undefined);
  translateService.getFallbackLang.mockReturnValue('en');
  
  fixture = TestBed.createComponent(HeaderComponent);
  component = fixture.componentInstance;
  
  expect(component.currentLang).toBe('en');
});
```

**`checkout.component.spec.ts`** - Add error handling test:

```typescript
it('should handle order creation error', () => {
  ordersServiceMock.createOrder.mockReturnValue(throwError(() => new Error('Order failed')));
  
  component.onConfirmOrder();
  
  expect(component.loading$.value).toBe(false);
});
```

---

## Verification

- [ ] E2E tests pass without running backend
- [ ] Accessibility tests run and report violations
- [ ] Visual regression tests create baseline screenshots
- [ ] Unit test coverage remains above thresholds
- [ ] CI pipeline runs all tests successfully

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/environments/environment.e2e.ts` | Create |
| `tests/e2e/fixtures/api-mocks.ts` | Create |
| `tests/e2e/accessibility.spec.ts` | Create |
| `tests/e2e/visual.spec.ts` | Create |
| `angular.json` | Modify (add e2e config) |
| `package.json` | Modify (add scripts) |
| `playwright.config.ts` | Modify (add visual config) |
