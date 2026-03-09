# Testing Guide

This document describes the testing strategy, tools, and patterns used in the Bookstore User SPA.

## Test Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Unit Tests | Jest + jest-preset-angular | Component, service, pipe, guard testing |
| E2E Tests | Playwright | Full user journey testing |
| Linting | ESLint + angular-eslint | Code quality enforcement |
| Code Quality | SonarQube | Static analysis and coverage tracking |
| Accessibility | Lighthouse | WCAG compliance auditing |

## Test Organization

```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.service.spec.ts       # Colocated unit test
│   │   │   ├── cart.service.ts
│   │   │   └── cart.service.spec.ts
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   └── auth.guard.spec.ts
│   │   └── interceptors/
│   │       ├── auth.interceptor.ts
│   │       ├── auth.interceptor.spec.ts
│   │       ├── error.interceptor.ts
│   │       ├── error.interceptor.spec.ts
│   │       ├── mock.interceptor.ts
│   │       └── mock.interceptor.spec.ts
│   └── features/
│       └── [feature]/
│           ├── pages/
│           │   └── [page]/
│           │       ├── [page].component.ts
│           │       └── [page].component.spec.ts
│           └── services/
│               ├── [feature].service.ts
│               └── [feature].service.spec.ts
│
tests/
└── e2e/
    ├── auth.spec.ts                        # Authentication E2E
    ├── catalog.spec.ts                     # Catalog browsing E2E
    ├── cart.spec.ts                        # Cart operations E2E
    ├── orders.spec.ts                      # Order flow E2E
    └── example.spec.ts                     # Basic smoke test
```

## Unit Testing (Jest)

### Configuration

Jest is configured in `jest.config.js`:

- **Preset**: `jest-preset-angular`
- **Setup file**: `src/setup-jest.ts`
- **Test match**: `src/**/*.spec.ts`
- **Module aliases**: `@app`, `@core`, `@shared`, `@environments`

### Running Unit Tests

```bash
npm test                  # Run all unit tests
npm run test:coverage     # Run with coverage report
npm run test:watch        # Watch mode for development
```

### Coverage Thresholds

Configured in `jest.config.js`:

| Metric | Minimum |
|--------|---------|
| Statements | 80% |
| Branches | 75% |
| Functions | 80% |
| Lines | 80% |

Coverage is collected from `src/app/**/*.ts`, excluding modules, routes, and `main.ts`.

### Service Test Pattern

```typescript
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should login and update state', () => {
    const mockResponse = { token: 'abc', refreshToken: 'xyz', user: { ... } };
    service.login({ email: 'test@test.com', password: 'pass' }).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(r => r.url.includes('/auth/login'));
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});
```

### Component Test Pattern

```typescript
describe('BookListComponent', () => {
  let component: BookListComponent;
  let fixture: ComponentFixture<BookListComponent>;
  let catalogServiceMock: jest.Mocked<CatalogService>;

  beforeEach(async () => {
    catalogServiceMock = {
      books$: of(mockBooks),
      loading$: of(false),
      loadBooks: jest.fn().mockReturnValue(of({ content: mockBooks }))
    } as any;

    await TestBed.configureTestingModule({
      imports: [BookListComponent, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [{ provide: CatalogService, useValue: catalogServiceMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(BookListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display book cards', () => {
    const cards = fixture.debugElement.queryAll(By.css('[data-testid^="catalog-book-card-"]'));
    expect(cards.length).toBe(mockBooks.length);
  });
});
```

### Guard Test Pattern

```typescript
describe('AuthGuard', () => {
  it('should allow access when authenticated', (done) => {
    authServiceMock.isAuthenticated$ = of(true);
    guard.canActivate({} as any, { url: '/orders' } as any).subscribe(result => {
      expect(result).toBe(true);
      done();
    });
  });

  it('should redirect to login when not authenticated', (done) => {
    authServiceMock.isAuthenticated$ = of(false);
    guard.canActivate({} as any, { url: '/orders' } as any).subscribe(result => {
      expect(result).toBe(false);
      expect(routerMock.navigate).toHaveBeenCalledWith(
        ['/auth/login'],
        { queryParams: { returnUrl: '/orders' } }
      );
      done();
    });
  });
});
```

## E2E Testing (Playwright)

### Configuration

Playwright is configured in `playwright.config.ts`:

- **Test directory**: `tests/e2e/`
- **Base URL**: `http://localhost:4200`
- **Browsers**: Chromium, Firefox, WebKit, Mobile (iPhone 13)
- **Web server**: Automatically starts `npm start` before tests
- **Artifacts**: Screenshots on failure, trace on first retry

### Running E2E Tests

```bash
npm run e2e              # Run all tests (headless)
npm run e2e:ui           # Playwright UI mode
npm run e2e:debug        # Debug mode with inspector
npm run e2e:codegen      # Record tests interactively
```

### E2E Test Coverage

| Test File | Coverage |
|-----------|----------|
| `auth.spec.ts` | Login, register, logout, invalid credentials |
| `catalog.spec.ts` | Book list, search, filters, book detail, pagination |
| `cart.spec.ts` | Add to cart, update quantity, remove item, checkout |
| `orders.spec.ts` | Order list, order detail, empty state |

### E2E Test Pattern

```typescript
test.describe('Authentication', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('[data-testid="auth-email-input"]', 'customer@example.com');
    await page.fill('[data-testid="auth-password-input"]', 'customer123');
    await page.click('[data-testid="auth-login-submit"]');
    await expect(page.locator('[data-testid="header-user-menu"]')).toBeVisible();
  });
});
```

## data-testid Convention

All interactive elements must have a `data-testid` attribute following this pattern:

```
[feature]-[element]-[action/modifier]
```

### Examples

| data-testid | Element |
|-------------|---------|
| `auth-login-submit` | Login form submit button |
| `auth-email-input` | Login email field |
| `catalog-book-card-1` | Book card for book ID 1 |
| `catalog-book-card-1-add-cart` | Add to cart button on book card |
| `cart-item-123-remove` | Remove button for cart item |
| `cart-checkout-btn` | Proceed to checkout button |
| `order-card-abc-view-btn` | View order button |
| `header-theme-toggle` | Theme toggle button |
| `header-lang-toggle` | Language toggle button |
| `catalog-loading` | Loading spinner |
| `catalog-empty-state` | Empty state display |

## Linting

```bash
npm run lint             # Check for issues
npm run lint:fix         # Auto-fix issues
```

ESLint is configured with `angular-eslint` rules in `eslint.config.js`.

## Code Quality (SonarQube)

SonarQube configuration is in `sonar-project.properties`:

- **Project key**: `bookstore:user:spa`
- **Sources**: `src/`
- **Coverage report**: `coverage/lcov.info`
- **Exclusions**: Tests, node_modules, dist, assets, config files

## Accessibility Testing

```bash
# Run Lighthouse accessibility audit
npm run lighthouse
# Requires the dev server running on port 4200
```

### WCAG 2.1 AA Checklist

- Color contrast ratio >= 4.5:1 (normal text), >= 3:1 (large text)
- All functionality available via keyboard
- Focus visible on all interactive elements
- Form errors announced to screen readers
- `prefers-reduced-motion` respected

## Bundle Size Budget

Defined in `angular.json`:

| Budget Type | Warning | Error |
|-------------|---------|-------|
| Initial bundle | 750 KB | 1.2 MB |
| Component style | 2 KB | 4 KB |

```bash
# Analyze bundle size
npm run analyze
```
