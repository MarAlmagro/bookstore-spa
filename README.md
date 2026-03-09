# Bookstore SPA — User Frontend

A modern, responsive Angular single-page application for the Bookstore microservices platform. Built as a portfolio project to demonstrate full-stack development with a microservices architecture.

> **AI Disclosure:** This project was developed with the assistance of AI coding tools (Windsurf Cascade and Claude). AI was used for code generation, architecture planning, documentation, and test scaffolding. All code was reviewed, validated, and curated by the developer. See [AI Tooling](#ai-tooling) for details.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Usage Guide](#usage-guide)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [AI Tooling](#ai-tooling)
- [Contributing](#contributing)
- [License](#license)

## Overview

This is the **user-facing frontend** for the Bookstore platform. It communicates with backend microservices (Catalog, Order, User) through a Spring Cloud API Gateway. The admin UI is a separate Thymeleaf application in the backend — this SPA handles only customer-facing functionality.

## Features

- **Authentication** — Login, registration, and JWT-based session management with automatic token refresh
- **Book Catalog** — Browse, search, and filter books with pagination and category filtering
- **Book Details** — View detailed information for individual books
- **Shopping Cart** — Client-side cart with localStorage persistence (no backend cart API)
- **Checkout** — Place orders via the Order Service API
- **Order History** — View past orders and order details
- **Internationalization** — Full English and Spanish support with runtime language switching
- **Dark Mode** — Light/dark theme toggle with localStorage persistence
- **Responsive Design** — Mobile, tablet, and desktop layouts
- **Accessibility** — WCAG 2.1 AA compliant with keyboard navigation and ARIA labels
- **Mock Mode** — Offline development with mock API responses

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Angular | 21.1.2 |
| UI Library | Angular Material | 21.1.2 |
| State Management | RxJS BehaviorSubject | 7.8 |
| Internationalization | ngx-translate | 17.0.0 |
| Styling | SCSS + Material Theme | — |
| Unit Testing | Jest | 30.x |
| E2E Testing | Playwright | 1.58.x |
| Linting | ESLint + angular-eslint | 21.x |
| Containerization | Docker + Nginx | Alpine |
| Code Quality | SonarQube | — |

## Architecture

```
┌─────────────────────────────────────────────────┐
│           Bookstore SPA (Port 4200)             │
│   Angular 21 + Material + ngx-translate + RxJS  │
└──────────────────────┬──────────────────────────┘
                       │ HTTP (via dev proxy / Nginx)
                       ▼
┌─────────────────────────────────────────────────┐
│           API Gateway (Port 8080)               │
│        Spring Cloud Gateway + Eureka            │
└──────────┬───────────┬──────────────┬───────────┘
           │           │              │
           ▼           ▼              ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │ Catalog  │ │  Order   │ │  User    │
    │ Service  │ │ Service  │ │ Service  │
    │ (MySQL)  │ │ (MongoDB)│ │(Postgres)│
    └──────────┘ └──────────┘ └──────────┘
```

For detailed architecture documentation, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Quick Start

### Prerequisites

- **Node.js** >= 18 (v22.x recommended)
- **npm** >= 9
- **Backend services** running on `http://localhost:8080` (or enable mock mode)

### Installation

```bash
# Clone the repository
git clone https://github.com/MarAlmagworeno/bookstore-spa.git
cd bookstore-spa

# Install dependencies
npm install
```

### Development Server

```bash
# Start with API proxy (requires backend on port 8080)
npm start
# → http://localhost:4200
```

### Offline Development (Mock Mode)

To develop without the backend, enable mock mode in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: '/api/v1',
  defaultLanguage: 'en',
  useMocks: true  // Enable mock API responses
};
```

Mock data is served from `src/assets/mocks/`.

## Usage Guide

### Browsing Books

1. Open the application at `http://localhost:4200`
2. The home page displays the book catalog with all available books
3. Use the **search bar** to find books by title or author
4. Use the **category filter** to browse by genre
5. Click on any book card to view its details

### Shopping Cart

1. Click **"Add to Cart"** on any book card or detail page
2. Access your cart via the cart icon in the header
3. Adjust quantities or remove items from the cart view
4. Cart data persists in your browser's localStorage

### Placing an Order

1. Add items to your cart
2. Click **"Proceed to Checkout"**
3. If not logged in, you will be redirected to the login page
4. Review your order and click **"Place Order"**
5. View your order confirmation and history under **"My Orders"**

### Authentication

1. Click **"Login"** in the header
2. Enter your credentials (or click **"Register"** to create an account)
3. After login, you can access checkout and order history
4. JWT tokens are managed automatically with refresh support

### Switching Language

Click the **language toggle** in the header to switch between English and Spanish. The preference is saved across sessions.

### Switching Theme

Click the **theme toggle** in the header to switch between light and dark mode. The preference is saved across sessions.

## Project Structure

```
bookstore-spa/
├── src/
│   ├── app/
│   │   ├── core/                  # Singleton services, guards, interceptors
│   │   │   ├── services/          # AuthService, CartService, ThemeService
│   │   │   ├── guards/            # AuthGuard
│   │   │   ├── interceptors/      # Auth, Error, Mock interceptors
│   │   │   └── constants/         # API endpoint constants
│   │   ├── shared/                # Reusable components (Header, EmptyState)
│   │   ├── features/              # Lazy-loaded feature modules
│   │   │   ├── auth/              # Login, Register pages
│   │   │   ├── catalog/           # Book list, detail, search, filters
│   │   │   ├── cart/              # Cart view, checkout
│   │   │   └── orders/            # Order list, order detail
│   │   └── models/                # TypeScript interfaces (DTOs)
│   ├── assets/
│   │   ├── i18n/                  # Translation files (en.json, es.json)
│   │   └── mocks/                 # Mock API responses
│   ├── environments/              # Environment configurations
│   └── styles/
│       └── _theme.scss            # Material custom theme (Indigo/Blue-Grey)
├── tests/
│   └── e2e/                       # Playwright E2E tests
├── docs/                          # Project documentation
│   ├── ARCHITECTURE.md            # Architecture guide
│   ├── DEVELOPMENT.md             # Development guide
│   ├── API.md                     # API integration reference
│   ├── TESTING.md                 # Testing guide
│   ├── DEPLOYMENT.md              # Deployment guide
│   └── contracts/                 # API contracts & OpenAPI spec
├── .windsurf/                     # AI agent rules, plans, specs
├── Dockerfile                     # Multi-stage Docker build
├── docker-compose.yml             # Standalone Docker Compose
├── nginx.conf                     # Nginx configuration for production
├── proxy.conf.json                # Dev proxy (→ localhost:8080)
├── playwright.config.ts           # Playwright E2E configuration
├── jest.config.js                 # Jest unit test configuration
├── sonar-project.properties       # SonarQube configuration
└── angular.json                   # Angular CLI configuration
```

## Testing

### Unit Tests (Jest)

```bash
npm test                 # Run all unit tests
npm run test:coverage    # Run with coverage report
npm run test:watch       # Watch mode
```

Coverage thresholds: 80% statements, 75% branches, 80% functions, 80% lines.

### E2E Tests (Playwright)

```bash
npm run e2e              # Run all E2E tests (headless)
npm run e2e:ui           # Run with Playwright UI
npm run e2e:debug        # Run in debug mode
```

E2E tests cover: authentication, catalog browsing, cart operations, and order flows.

### Linting

```bash
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix linting issues
```

For the full testing strategy, see [docs/TESTING.md](docs/TESTING.md).

## Deployment

### Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t bookstore-spa:latest .
docker run -p 4200:80 bookstore-spa:latest
```

The Docker image uses a multi-stage build (Node.js build + Nginx Alpine) and serves the SPA on port 80. Nginx proxies `/api/` requests to the backend gateway.

### Production Build

```bash
npm run build:prod
```

Output is written to `dist/bookstore-spa/`. Bundle size budgets: 750KB warning, 1.2MB error.

For detailed deployment instructions, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Documentation

| Document | Description |
|----------|-------------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture, module design, state management |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Local setup, environment config, coding standards |
| [docs/API.md](docs/API.md) | API endpoints, authentication, error handling |
| [docs/TESTING.md](docs/TESTING.md) | Testing strategy, patterns, coverage requirements |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Docker, Nginx, production deployment |
| [docs/contracts/](docs/contracts/) | OpenAPI spec, gateway routing, TypeScript models |

## AI Tooling

This project was developed using an **AI-assisted development workflow**. The following tools were used:

| Tool | Role |
|------|------|
| **Windsurf Cascade** | Primary AI coding assistant — code generation, refactoring, debugging |
| **Claude (Anthropic)** | Architecture planning, documentation, code review |

### How AI Was Used

- **Architecture & Planning** — AI helped define the module structure, implementation phases, and coding standards (see `.windsurf/plans/`)
- **Code Generation** — Components, services, interceptors, guards, and tests were scaffolded with AI assistance
- **Documentation** — READMEs, API docs, and specification documents were drafted with AI
- **Testing** — Unit and E2E test scaffolding, mock data generation
- **Code Review** — AI reviewed code for patterns, accessibility, and best practices

### Human Oversight

All AI-generated code was:
- Reviewed and validated by the developer
- Tested against the actual backend API
- Adjusted for project-specific requirements
- Committed through deliberate, atomic git commits

The AI agent rules and specifications used during development are preserved in `.windsurf/` for transparency.

## Contributing

### Development Guidelines

1. **Type Safety** — No `any` types; define interfaces in `src/app/models/`
2. **Component Size** — Components must be under 300 lines
3. **Lazy Loading** — All feature modules are lazy-loaded
4. **Observable Pattern** — Use RxJS operators + `async` pipe; no nested subscriptions
5. **Error Handling** — All API errors trigger MatSnackBar notifications
6. **Accessibility** — `data-testid` on all interactive elements; `aria-label` on icon buttons
7. **i18n** — All user-facing text uses translation keys

### Commit Convention

```
feat(feature): description     # New feature
fix(feature): description      # Bug fix
refactor(feature): description # Code refactoring
test(feature): description     # Test additions
docs: description              # Documentation
chore: description             # Build, config, deps
```

### Workflow

```bash
git checkout -b feature/your-feature-name
# Make changes, write tests
npm test && npm run lint
git commit -m "feat(catalog): add advanced search filters"
git push origin feature/your-feature-name
```

## Troubleshooting

**CORS Errors** — Ensure the API Gateway is running on port 8080 and `proxy.conf.json` is configured. The dev server uses the proxy automatically.

**Module Not Found** — Run `npm install`. If the issue persists, delete `node_modules/` and `.angular/cache/`, then reinstall.

**Port Already in Use** — Run `ng serve --port 4201` or kill the process using port 4200.

**Mock Mode Not Working** — Verify `environment.useMocks` is set to `true` and mock JSON files exist in `src/assets/mocks/`.

## License

MIT License — Copyright (c) 2026 Maria del Mar Almagro Moreno

See [LICENSE](LICENSE) for details.

---

**Built with Angular 21.1.2** | **Last Updated**: March 2026
