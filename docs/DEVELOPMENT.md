# Development Guide

This document covers how to set up, run, and develop the Bookstore User SPA.

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | >= 18 | v22.x recommended |
| npm | >= 9 | v11.x currently used |
| Angular CLI | 21.1.2 | Installed as dev dependency |
| Backend services | — | Running on `http://localhost:8080` (optional with mock mode) |

## Setup

```bash
# Clone the repository
git clone https://github.com/MarAlmagworeno/bookstore-spa.git
cd bookstore-spa

# Install dependencies
npm install
```

## Running the Application

### With Backend (Normal Mode)

Requires the backend microservices and API Gateway running on port 8080.

```bash
npm start
# → http://localhost:4200
```

The dev server automatically proxies `/api/*` requests to `http://localhost:8080` via `proxy.conf.json`.

### Without Backend (Mock Mode)

For offline development, enable mock mode in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: '/api/v1',
  apiGateway: 'http://localhost:8080',
  defaultLanguage: 'en',
  useMocks: true  // ← Enable mock mode
};
```

The `MockInterceptor` will return data from `src/assets/mocks/`:

| File | Endpoint |
|------|----------|
| `books.json` | `GET /api/v1/books` |
| `book-page.json` | `GET /api/v1/books/page` |
| `auth-response.json` | `POST /api/v1/auth/login`, `POST /api/v1/auth/register` |
| `orders.json` | `GET /api/v1/orders/user/*` |
| `user.json` | `GET /api/v1/users/profile` |

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Start dev server | `npm start` | Starts on port 4200 with proxy |
| Build (dev) | `npm run build` | Development build |
| Build (prod) | `npm run build:prod` | Production build with optimizations |
| Unit tests | `npm test` | Run Jest unit tests |
| Unit tests + coverage | `npm run test:coverage` | Run with coverage report |
| Unit tests (watch) | `npm run test:watch` | Watch mode for development |
| E2E tests | `npm run e2e` | Run Playwright tests (headless) |
| E2E tests (UI) | `npm run e2e:ui` | Run with Playwright UI |
| E2E tests (debug) | `npm run e2e:debug` | Debug mode |
| E2E codegen | `npm run e2e:codegen` | Generate tests by recording |
| Lint | `npm run lint` | Run ESLint |
| Lint (fix) | `npm run lint:fix` | Auto-fix linting issues |
| Bundle analysis | `npm run analyze` | Analyze production bundle size |
| Accessibility | `npm run lighthouse` | Run Lighthouse accessibility audit |

## Environment Configuration

### Development (`src/environments/environment.ts`)

```typescript
export const environment = {
  production: false,
  apiUrl: '/api/v1',          // Proxied to localhost:8080
  apiGateway: 'http://localhost:8080',
  defaultLanguage: 'en',
  useMocks: false             // Set true for offline development
};
```

### Production (`src/environments/environment.prod.ts`)

```typescript
export const environment = {
  production: true,
  apiUrl: '/api/v1',          // Nginx proxies to gateway
  defaultLanguage: 'en',
  useMocks: false
};
```

Angular CLI automatically swaps `environment.ts` → `environment.prod.ts` in production builds (configured in `angular.json`).

## Proxy Configuration

`proxy.conf.json` forwards API requests during development:

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "logLevel": "debug",
    "changeOrigin": true
  }
}
```

This is automatically used by `ng serve` (configured in `angular.json` → `serve.options.proxyConfig`).

## Coding Standards

### File Naming

```
Components:  feature-name.component.ts
Services:    feature-name.service.ts
Guards:      feature-name.guard.ts
Pipes:       feature-name.pipe.ts
Models:      feature-name.model.ts
Tests:       *.spec.ts (colocated with source)
```

### Import Order

```typescript
// 1. Angular core
import { Component } from '@angular/core';

// 2. Angular modules
import { CommonModule } from '@angular/common';

// 3. Third-party
import { TranslateModule } from '@ngx-translate/core';

// 4. App core/shared (barrel imports)
import { AuthService } from '@core';
import { EmptyStateComponent } from '@shared';

// 5. Feature-local
import { BookCardComponent } from './components';
```

### Component Pattern

- Use `ChangeDetectionStrategy.OnPush`
- Keep components under 300 lines
- Use `async` pipe in templates for observables
- No nested subscriptions — use RxJS operators

### Service Pattern

- Observable Data Service with `BehaviorSubject`
- Public read-only observables via `.asObservable()`
- Private mutable state
- One primary service per feature module

### Type Safety

- No `any` types — define interfaces in `src/app/models/`
- All models have barrel exports via `index.ts`

### Accessibility

- `data-testid` attribute on all interactive elements
- `aria-label` on all icon buttons
- `mat-label` on all form fields
- Keyboard navigation must work for all flows
- Respect `prefers-reduced-motion`

### Internationalization

- All user-facing text must use i18n keys
- Translation keys must be added to both `en.json` and `es.json`
- No hardcoded user-facing strings

## Path Aliases

Configured in `tsconfig.json` and `jest.config.js`:

| Alias | Path |
|-------|------|
| `@app/*` | `src/app/*` |
| `@core/*` | `src/app/core/*` |
| `@shared/*` | `src/app/shared/*` |
| `@environments/*` | `src/environments/*` |

## Troubleshooting

### `ng serve` fails with CORS errors

Verify `proxy.conf.json` exists and `angular.json` references it in `serve.options.proxyConfig`. Ensure the backend is running on port 8080.

### Module not found errors

```bash
# Clear cache and reinstall
rm -rf node_modules .angular/cache
npm install
```

### Port 4200 already in use

```bash
ng serve --port 4201
```

### Jest tests fail with module resolution

Verify `jest.config.js` has the correct `moduleNameMapper` entries matching your `tsconfig.json` path aliases.

### Mock mode returns no data

Ensure `useMocks: true` in `environment.ts` and that JSON files exist in `src/assets/mocks/`.
