# Architecture

This document describes the architecture of the Bookstore User SPA.

## System Overview

The Bookstore SPA is a standalone Angular single-page application that serves as the customer-facing frontend for a microservices-based bookstore platform. It communicates exclusively with backend services through a Spring Cloud API Gateway.

```
┌──────────────────────────────────────────────────────┐
│              Bookstore SPA (Port 4200)               │
│      Angular 21.1.2 + Material + ngx-translate       │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐  │
│  │   Auth   │ │ Catalog  │ │  Cart  │ │  Orders  │  │
│  │  Module  │ │  Module  │ │ Module │ │  Module  │  │
│  └──────────┘ └──────────┘ └────────┘ └──────────┘  │
│          │           │          │           │        │
│          └───────────┴──────────┴───────────┘        │
│                         │                            │
│              ┌──────────┴──────────┐                 │
│              │   Core Services     │                 │
│              │ Auth, Cart, Theme   │                 │
│              │ Interceptors/Guards │                 │
│              └──────────┬──────────┘                 │
└─────────────────────────┼────────────────────────────┘
                          │ HTTP (proxy in dev / Nginx in prod)
                          ▼
┌──────────────────────────────────────────────────────┐
│              API Gateway (Port 8080)                 │
│           Spring Cloud Gateway + Eureka              │
└───────────┬──────────────┬──────────────┬────────────┘
            │              │              │
            ▼              ▼              ▼
     ┌──────────┐   ┌──────────┐   ┌──────────┐
     │ Catalog  │   │  Order   │   │  User    │
     │ Service  │   │ Service  │   │ Service  │
     │  :8081   │   │  :8082   │   │  :8083   │
     │ (MySQL)  │   │(MongoDB) │   │(Postgres)│
     └──────────┘   └──────────┘   └──────────┘
```

## Scope Boundaries

### This SPA Handles

- User authentication (login, register, logout)
- Book browsing, searching, filtering
- Shopping cart (client-side only)
- Order placement and order history

### Out of Scope

- **Admin functionality** — Book CRUD, user management, order status updates are handled by a separate Thymeleaf admin UI in the backend
- **Server-side rendering** — This is a pure client-side SPA
- **Direct database access** — All data flows through the API Gateway

## Module Architecture

The application follows Angular's modular architecture with lazy-loaded feature modules.

### Module Hierarchy

```
AppModule
├── CoreModule (singleton services, guards, interceptors)
├── SharedModule (reusable components, pipes)
└── Feature Modules (lazy-loaded)
    ├── AuthModule       → /auth/*
    ├── CatalogModule    → /books/*
    ├── CartModule       → /cart/*
    └── OrdersModule     → /orders/*
```

### Core Module (`src/app/core/`)

Singleton services and infrastructure that are instantiated once for the entire application.

| Component | File | Purpose |
|-----------|------|---------|
| AuthService | `services/auth.service.ts` | JWT authentication, login, register, logout, token refresh |
| CartService | `services/cart.service.ts` | Client-side cart management (localStorage) |
| ThemeService | `services/theme.service.ts` | Light/dark theme toggle with persistence |
| AuthGuard | `guards/auth.guard.ts` | Protects routes requiring authentication |
| AuthInterceptor | `interceptors/auth.interceptor.ts` | Attaches JWT bearer token to requests |
| ErrorInterceptor | `interceptors/error.interceptor.ts` | Global HTTP error handling + snackbar |
| MockInterceptor | `interceptors/mock.interceptor.ts` | Returns mock data when `useMocks: true` |
| API Constants | `constants/api.constants.ts` | Centralized API endpoint paths |

### Shared Module (`src/app/shared/`)

Reusable, presentational components used across features.

| Component | Purpose |
|-----------|---------|
| HeaderComponent | App header with navigation, auth status, language/theme toggles |
| EmptyStateComponent | Generic empty state display (no items, no results) |

### Feature Modules

Each feature module is **lazy-loaded** via Angular Router and self-contained.

#### Auth Module (`/auth/*`)
- **Login Page** — Email/password form with validation
- **Register Page** — Registration form (firstName, lastName, email, password)

#### Catalog Module (`/books/*`)
- **Book List Page** — Paginated grid of books with category filtering
- **Book Detail Page** — Full book information with add-to-cart
- **Search Results Page** — Search results with query display
- **BookCard Component** — Reusable book card for grid display
- **BookFilters Component** — Category filter and search controls
- **CatalogService** — Book data fetching (Observable Data Service)

#### Cart Module (`/cart/*`)
- **Cart View Page** — List of cart items with quantity controls
- **Checkout Page** — Order review and placement (AuthGuard protected)
- **CartItem Component** — Individual cart item display
- **CartSummary Component** — Subtotal, shipping, total calculation

#### Orders Module (`/orders/*`)
- **Order List Page** — User's order history (AuthGuard protected)
- **Order Detail Page** — Individual order details (AuthGuard protected)
- **OrderCard Component** — Order summary card for list view
- **OrderStatusBadge Component** — Color-coded order status display
- **OrdersService** — Order data fetching (Observable Data Service)

## State Management

The application uses the **Observable Data Service** pattern with RxJS `BehaviorSubject` — no external state management library (NgRx, Akita, etc.).

### Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class FeatureService {
  // Private mutable state
  private readonly _items$ = new BehaviorSubject<Item[]>([]);
  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  // Public read-only observables
  readonly items$ = this._items$.asObservable();
  readonly loading$ = this._loading$.asObservable();

  loadItems(): Observable<Item[]> {
    this._loading$.next(true);
    return this.http.get<Item[]>(`${environment.apiUrl}/items`).pipe(
      tap(items => this._items$.next(items)),
      finalize(() => this._loading$.next(false))
    );
  }
}
```

### State Storage

| State | Location | Persistence |
|-------|----------|-------------|
| Auth token (access) | In-memory (AuthService) | Session only |
| Refresh token | localStorage | Across sessions |
| Cart items | localStorage (via CartService) | Across sessions |
| Theme preference | localStorage (via ThemeService) | Across sessions |
| Book/order data | In-memory (BehaviorSubject) | Session only |

## Routing

All feature modules are lazy-loaded. Protected routes use `AuthGuard`.

| Route | Module | Guard |
|-------|--------|-------|
| `/` | Redirect → `/books` | — |
| `/auth/login` | AuthModule | — |
| `/auth/register` | AuthModule | — |
| `/books` | CatalogModule | — |
| `/books/search` | CatalogModule | — |
| `/books/:id` | CatalogModule | — |
| `/cart` | CartModule | — |
| `/cart/checkout` | CartModule | AuthGuard |
| `/orders` | OrdersModule | AuthGuard |
| `/orders/:id` | OrdersModule | AuthGuard |

## HTTP Layer

### Interceptor Chain

Interceptors are applied in this order:

1. **AuthInterceptor** — Attaches `Authorization: Bearer <token>` header
2. **ErrorInterceptor** — Catches HTTP errors, shows MatSnackBar, handles 401 (redirect to login)
3. **MockInterceptor** — When `environment.useMocks: true`, returns mock JSON responses instead of making real HTTP calls

### API Communication

- **Development**: `ng serve` uses `proxy.conf.json` to forward `/api/*` to `http://localhost:8080`
- **Production**: Nginx reverse-proxies `/api/` to the API Gateway (`host.docker.internal:8080`)

## Theming

The application uses Angular Material's theming system with a custom palette:

- **Primary**: Indigo
- **Accent**: Blue-Grey
- **Warn**: Red

Themes are defined in `src/styles/_theme.scss`. Dark mode is toggled via a `.dark-theme` CSS class on `<body>`, controlled by `ThemeService`.

## Internationalization

- **Library**: ngx-translate
- **Languages**: English (en), Spanish (es)
- **Default**: English
- **Translation files**: `src/assets/i18n/en.json`, `src/assets/i18n/es.json`
- **Runtime switching**: Language toggle in header, preference saved to localStorage

## Cart Strategy

The backend has **no cart API**. Cart is implemented entirely on the client side:

1. `CartService` manages a `BehaviorSubject<CartItem[]>`
2. Cart state is synced to `localStorage` on every change
3. On checkout, cart items are converted to an `OrderDto` and POSTed to `/api/v1/orders`
4. Cart is cleared after successful order creation
