# Plan 04: Security Hardening

**Priority**: Medium 🟡  
**Estimated Effort**: 2-3 hours  
**Dependencies**: None

---

## Objective

Implement security best practices including CSP headers, security documentation, and additional hardening measures.

---

## Tasks

### 1. Add Security Headers to Nginx

Update `nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    
    # Content Security Policy
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' http://localhost:8080 https://api.example.com; frame-ancestors 'self';" always;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://host.docker.internal:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    error_page 404 /index.html;
}
```

### 2. Create SECURITY.md

Create `SECURITY.md` in project root:

```markdown
# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by:

1. **Email**: security@example.com
2. **Do NOT** create a public GitHub issue

We will respond within 48 hours and work with you to understand and resolve the issue.

## Security Measures

### Authentication

- **JWT Tokens**: Access tokens stored in-memory, refresh tokens in localStorage
- **Token Refresh**: Automatic refresh on 401 responses
- **Secure Transmission**: All API calls over HTTPS in production

### Data Protection

- **No Sensitive Data in localStorage**: Only refresh tokens stored
- **Input Validation**: All forms validated before submission
- **XSS Prevention**: Angular's built-in sanitization, no innerHTML usage

### HTTP Security Headers

Production nginx configuration includes:

- `X-Frame-Options: SAMEORIGIN` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - XSS filter
- `Content-Security-Policy` - Restricts resource loading
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer info

### Dependencies

- Regular dependency updates via Dependabot
- npm audit run in CI pipeline
- No known vulnerable dependencies

## Security Checklist for Contributors

- [ ] No hardcoded credentials or API keys
- [ ] No `innerHTML` or `bypassSecurityTrust*` usage
- [ ] All user input validated and sanitized
- [ ] No sensitive data logged to console
- [ ] HTTPS used for all external requests
```

### 3. Add npm Audit to CI

Update `.github/workflows/ci.yml`:

```yaml
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run npm audit
        run: npm audit --audit-level=high
      
      - name: Check for known vulnerabilities
        run: npx audit-ci --high
```

### 4. Sanitize Error Messages

Update `error.interceptor.ts` to avoid leaking sensitive info:

```typescript
private showErrorMessage(error: HttpErrorResponse): void {
  let messageKey = 'errors.serverError';

  // Don't expose detailed error messages to users
  switch (error.status) {
    case 400:
      messageKey = 'errors.badRequest';
      break;
    case 401:
      messageKey = 'errors.unauthorized';
      break;
    case 403:
      messageKey = 'errors.forbidden';
      break;
    case 404:
      messageKey = 'errors.notFound';
      break;
    case 0:
      messageKey = 'errors.networkError';
      break;
    default:
      // Log detailed error for debugging, show generic message to user
      if (!environment.production) {
        console.error('HTTP Error:', error);
      }
      messageKey = 'errors.serverError';
  }

  this.translate.get(messageKey).subscribe(message => {
    this.snackBar.open(message, this.translate.instant('common.close'), {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  });
}
```

### 5. Add Subresource Integrity (SRI)

For any external scripts loaded via CDN, add integrity attributes:

```html
<link 
  href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" 
  rel="stylesheet"
  crossorigin="anonymous">
```

### 6. Secure localStorage Usage

Create a secure storage service:

```typescript
// src/app/core/services/secure-storage.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SecureStorageService {
  private readonly prefix = 'bookstore_';

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(this.prefix + key, value);
    } catch (error) {
      // Handle quota exceeded or private browsing
      console.warn('Storage unavailable');
    }
  }

  getItem(key: string): string | null {
    try {
      return localStorage.getItem(this.prefix + key);
    } catch {
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch {
      // Ignore errors
    }
  }

  clear(): void {
    try {
      // Only clear items with our prefix
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => localStorage.removeItem(key));
    } catch {
      // Ignore errors
    }
  }
}
```

---

## Verification

- [ ] Security headers present in nginx responses
- [ ] SECURITY.md created and accurate
- [ ] npm audit passes with no high/critical vulnerabilities
- [ ] Error messages don't leak sensitive information
- [ ] No console.log statements with sensitive data

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `SECURITY.md` | Create |
| `nginx.conf` | Modify (add headers) |
| `.github/workflows/ci.yml` | Modify (add security job) |
| `error.interceptor.ts` | Modify (sanitize errors) |
| `secure-storage.service.ts` | Create (optional) |
