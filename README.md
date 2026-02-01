# 📚 Bookstore SPA - User Frontend

A modern, responsive Angular single-page application for the Bookstore microservices platform. This standalone repository provides end-users with a seamless book browsing and ordering experience.

## 🎯 Project Overview

This is the **user-facing frontend** for the Bookstore platform, built with Angular 14+ and Angular Material. It communicates with backend microservices through an API Gateway and supports multiple languages (Spanish/English) with a modern, accessible design system.

## 🛠️ Tech Stack

- **Framework**: Angular 14.2.3
- **UI Library**: Angular Material (with custom theming)
- **State Management**: RxJS BehaviorSubject (Observable Data Services)
- **Internationalization**: ngx-translate
- **Styling**: SCSS with Material Design
- **HTTP Client**: Angular HttpClient with Interceptors
- **Routing**: Angular Router with Lazy Loading
- **Build Tool**: Angular CLI
- **Package Manager**: npm

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│         Bookstore SPA (Port 4200)           │
│    Angular 14 + Material + ngx-translate    │
└─────────────────────────────────────────────┘
                    │
                    │ HTTP (via Proxy)
                    ▼
┌─────────────────────────────────────────────┐
│         API Gateway (Port 8080)             │
│       Spring Cloud Gateway + Eureka         │
└─────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐
   │ Catalog │ │  Order  │ │  User   │
   │ Service │ │ Service │ │ Service │
   └─────────┘ └─────────┘ └─────────┘
```

## 🚀 Local Development Setup

### Prerequisites

- **Node.js**: v16+ (v22.16.0 currently used, though unsupported warning may appear)
- **npm**: v11.6.4+
- **Angular CLI**: v14.2.3 (installed globally or use npx)
- **API Gateway**: Running on `http://localhost:8080`

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd bookstore-spa

# Install dependencies
npm install

# Start development server with proxy
ng serve

# Application will be available at http://localhost:4200
```

### Development Proxy

The application uses a development proxy (`proxy.conf.json`) to forward API requests to the backend gateway:

- **Frontend**: `http://localhost:4200`
- **API Gateway**: `http://localhost:8080`
- **Proxy Path**: `/api/*` → `http://localhost:8080/api/*`

This configuration prevents CORS issues during local development.

## 📁 Project Structure

```
bookstore-spa/
├── src/
│   ├── app/
│   │   ├── core/              # Core module (services, guards, interceptors)
│   │   ├── shared/            # Shared components, directives, pipes
│   │   ├── features/          # Feature modules (lazy-loaded)
│   │   │   ├── catalog/       # Book catalog & search
│   │   │   ├── orders/        # Order management
│   │   │   └── auth/          # Authentication & user profile
│   │   ├── models/            # TypeScript interfaces & DTOs
│   │   └── app.module.ts
│   ├── assets/
│   │   ├── i18n/              # Translation files (es.json, en.json)
│   │   └── mocks/             # Mock data for development
│   ├── environments/          # Environment configurations
│   └── styles/
│       ├── _theme.scss        # Material custom theme
│       └── styles.scss        # Global styles
├── docs/
│   └── contracts/             # API contracts & OpenAPI spec
├── angular.json
├── proxy.conf.json            # Development proxy configuration
├── package.json
└── README.md
```

## 🎨 Design System

### Material Theme

The application uses a custom Angular Material theme with support for light and dark modes:

- **Primary Color**: Indigo
- **Accent Color**: Slate
- **Dark Mode**: Togglable via `.dark-theme` class
- **Responsive**: Mobile-first design using Angular CDK BreakpointObserver

### Accessibility

- Semantic HTML5 elements
- ARIA labels on all interactive components
- Keyboard navigation support
- Screen reader friendly
- WCAG 2.1 AA compliant

## 🌍 Internationalization (i18n)

The application supports multiple languages using ngx-translate:

- **Default Language**: Spanish (ES)
- **Available Languages**: Spanish (ES), English (EN)
- **Translation Files**: `src/assets/i18n/{lang}.json`
- **Language Toggle**: Available in header component

## 🔐 Authentication & Security

### JWT Token Flow

1. User logs in via `/api/v1/auth/login`
2. Backend returns JWT token
3. Token stored securely (HttpOnly recommended for production)
4. HTTP Interceptor automatically adds `Authorization: Bearer {token}` header
5. Token refresh via `/api/v1/auth/refresh`

### Protected Routes

- Route guards validate authentication state
- Unauthorized users redirected to login
- Role-based access control (RBAC) for admin features

## 🧪 Testing

```bash
# Run unit tests
ng test

# Run tests with coverage
ng test --code-coverage

# Run e2e tests (requires setup)
ng e2e
```

### Testing Guidelines

- All interactive elements must have `data-testid` attributes
- Components should be unit tested with Jest
- Services should be tested with mock data
- Integration tests for critical user flows

## 📦 Build & Deployment

### Development Build

```bash
ng build
```

### Production Build

```bash
ng build --configuration production
```

Build artifacts will be stored in the `dist/` directory.

### Docker Deployment

```bash
# Build Docker image
docker build -t bookstore-spa:latest .

# Run with Docker Compose
docker-compose up -d
```

The application will be served via Nginx on port 80 (configurable).

## 🔧 Environment Configuration

### Environment Files

- `environment.ts` - Development configuration
- `environment.prod.ts` - Production configuration

### Key Configuration

```typescript
export const environment = {
  production: false,
  apiUrl: '/api/v1',  // Proxied to http://localhost:8080/api/v1
  defaultLanguage: 'es',
  enableMocks: false
};
```

**Important**: Never hardcode API URLs in services. Always use `environment.apiUrl`.

## 📚 API Endpoints

The SPA communicates with the following backend services via the API Gateway:

### Catalog Service
- `GET /api/v1/books` - List all books
- `GET /api/v1/books/{id}` - Get book details
- `GET /api/v1/books/search` - Search books

### Order Service
- `GET /api/v1/orders/user/{userId}` - Get user orders
- `POST /api/v1/orders` - Create new order

### User Service
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/users/profile` - Get user profile

For complete API documentation, see `docs/contracts/openapi.json`.

## 🐛 Troubleshooting

### Common Issues

**CORS Errors**
- Ensure API Gateway is running on port 8080
- Verify `proxy.conf.json` is configured correctly
- Check that `ng serve` is using the proxy configuration

**Module Not Found**
- Run `npm install` to ensure all dependencies are installed
- Clear Angular cache: `rm -rf .angular/cache`

**Port Already in Use**
- Change port: `ng serve --port 4201`
- Or kill process using port 4200

## 🤝 Contributing

### Development Guidelines

1. **Type Safety**: No `any` types - define interfaces in `models/` folder
2. **Component Purity**: Components handle UI only, business logic in services
3. **Lazy Loading**: All feature modules must be lazy-loaded
4. **Error Handling**: All API errors trigger MatSnackBar notifications
5. **Code Style**: Follow Angular style guide and use Prettier

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make atomic commits
git commit -m "feat: add book search functionality"

# Push and create PR
git push origin feature/your-feature-name
```

## 📄 License

This project is part of the Bookstore microservices platform.

## 📞 Support

For issues and questions:
- Check `docs/contracts/` for API documentation
- Review Angular Material documentation
- Consult the project constraints in `.windsurf/rules/`

---

**Generated with Angular CLI 14.2.3** | **Last Updated**: January 2026
