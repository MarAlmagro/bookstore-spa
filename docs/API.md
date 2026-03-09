# API Integration Reference

This document describes how the Bookstore SPA integrates with the backend microservices.

## Overview

The SPA communicates with three backend microservices through a Spring Cloud API Gateway:

| Service | Port | Database | Purpose |
|---------|------|----------|---------|
| Catalog Service | 8081 | MySQL | Book management |
| Order Service | 8082 | MongoDB | Order management |
| User Service | 8083 | PostgreSQL | Authentication & profiles |
| **API Gateway** | **8080** | — | **Single entry point** |

All requests from the SPA go to `http://localhost:8080` (via proxy in development, via Nginx in production).

## Authentication

### JWT Flow

```
1. POST /api/v1/auth/login  { email, password }
   → { token, refreshToken, user }

2. Store access token in memory (AuthService)
   Store refresh token in localStorage

3. All subsequent requests include:
   Authorization: Bearer <access_token>

4. On 401 response → attempt token refresh:
   POST /api/v1/auth/refresh  { refreshToken }
   → { token, refreshToken, user }

5. If refresh fails → redirect to login
```

### AuthInterceptor

The `AuthInterceptor` automatically attaches the JWT token to all outgoing HTTP requests:

```typescript
// Simplified flow
intercept(req, next) {
  const token = this.authService.getToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next.handle(req);
}
```

## Endpoints

### Authentication (Public)

| Method | Path | Request Body | Response | Description |
|--------|------|-------------|----------|-------------|
| POST | `/api/v1/auth/login` | `AuthRequest` | `AuthResponse` | User login |
| POST | `/api/v1/auth/register` | `RegisterRequest` | `AuthResponse` | User registration |
| POST | `/api/v1/auth/refresh` | `{ refreshToken }` | `AuthResponse` | Refresh JWT token |

### Catalog (Public)

| Method | Path | Parameters | Response | Description |
|--------|------|-----------|----------|-------------|
| GET | `/api/v1/books` | — | `Book[]` | List all books |
| GET | `/api/v1/books/page` | `page`, `size` | `PageResponse<Book>` | Paginated book list |
| GET | `/api/v1/books/{id}` | `id` (path) | `Book` | Book details |
| GET | `/api/v1/books/search` | `query` (param) | `Book[]` | Search books |
| GET | `/api/v1/books/category/{category}` | `category` (path) | `Book[]` | Books by category |

### Orders (Authenticated)

| Method | Path | Request Body | Response | Description |
|--------|------|-------------|----------|-------------|
| POST | `/api/v1/orders` | `OrderRequest` | `Order` | Create new order |
| GET | `/api/v1/orders/user/{userId}` | `userId` (path) | `Order[]` | User's order history |
| GET | `/api/v1/orders/{id}` | `id` (path) | `Order` | Order details |

### Profile (Authenticated)

| Method | Path | Request Body | Response | Description |
|--------|------|-------------|----------|-------------|
| GET | `/api/v1/users/profile` | — | `User` | Get current user profile |
| PUT | `/api/v1/users/profile` | `User` | `User` | Update user profile |

## Data Models

All TypeScript interfaces are defined in `src/app/models/`.

### AuthRequest

```typescript
interface AuthRequest {
  email: string;
  password: string;
}
```

### RegisterRequest

```typescript
interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
```

### AuthResponse

```typescript
interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}
```

### User

```typescript
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}
```

### Book

```typescript
interface Book {
  id: number;
  isbn: string;
  title: string;
  author: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}
```

### Order

```typescript
interface Order {
  id: string;
  userId: number;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}
```

### OrderItem

```typescript
interface OrderItem {
  bookId: number;
  title: string;
  quantity: number;
  price: number;
  subtotal: number;
}
```

### PageResponse

```typescript
interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
```

### CartItem (Client-side only)

```typescript
interface CartItem {
  book: Book;
  quantity: number;
}
```

## Error Handling

### Error Response Format

The backend returns errors in this format:

```json
{
  "timestamp": "2026-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Detailed error message",
  "path": "/api/v1/..."
}
```

### ErrorInterceptor

The `ErrorInterceptor` handles all HTTP errors globally:

| Status | Behavior |
|--------|----------|
| 400 | Shows validation error message via MatSnackBar |
| 401 | Attempts token refresh; if that fails, redirects to login |
| 403 | Shows "forbidden" message |
| 404 | Shows "not found" message |
| 500+ | Shows generic server error message |
| Network error | Shows connection error message |

All error messages use i18n keys from `src/assets/i18n/*.json` under the `errors.*` namespace.

## Cart → Order Flow

Since the backend has no cart API, the checkout flow converts client-side cart data to an API order:

```
CartItem[] (localStorage)
    ↓
Convert to OrderRequest:
{
  userId: currentUser.id,
  items: cartItems.map(item => ({
    bookId: item.book.id,
    quantity: item.quantity
  }))
}
    ↓
POST /api/v1/orders
    ↓
On success → clear cart, navigate to order confirmation
```

## OpenAPI Specification

The complete API contract is available at `docs/contracts/openapi.json`. It can be imported into:

- **Swagger UI** — For interactive API exploration
- **Postman** — For manual API testing
- **OpenAPI Generator** — For client code generation

## Testing Against the API

```bash
# Get all books
curl http://localhost:8080/api/v1/books

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"customer123"}'

# Create order (with JWT)
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"userId":1,"items":[{"bookId":1,"quantity":2}]}'
```

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@example.com | customer123 |
