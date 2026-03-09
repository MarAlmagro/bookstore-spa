# Deployment Guide

This document covers how to build and deploy the Bookstore User SPA.

## Production Build

```bash
npm run build:prod
```

This runs `ng build --configuration production`, which:

- Enables ahead-of-time (AOT) compilation
- Applies tree-shaking and dead code elimination
- Minifies and optimizes the bundle
- Replaces `environment.ts` with `environment.prod.ts`
- Applies output hashing for cache-busting
- Enforces bundle size budgets (750KB warning, 1.2MB error)

Build artifacts are written to `dist/bookstore-spa/`.

## Docker Deployment

### Architecture

The Docker image uses a multi-stage build:

1. **Build stage** — Node.js compiles the Angular app
2. **Serve stage** — Nginx Alpine serves the static files

### Dockerfile

```dockerfile
# Stage 1: Build
FROM node:16-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist/bookstore-spa /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Build and Run

```bash
# Build the Docker image
docker build -t bookstore-spa:latest .

# Run the container
docker run -p 4200:80 bookstore-spa:latest
```

The SPA will be available at `http://localhost:4200`.

### Docker Compose

```bash
docker-compose up -d
```

This uses `docker-compose.yml` which:

- Builds the image from the Dockerfile
- Maps port 4200 (host) → 80 (container)
- Includes a health check (`wget` to `http://localhost:80`)
- Uses `unless-stopped` restart policy

## Nginx Configuration

The `nginx.conf` file handles:

### SPA Routing

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

All routes fall back to `index.html` so Angular Router handles client-side navigation.

### API Proxy

```nginx
location /api/ {
    proxy_pass http://host.docker.internal:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

API requests are forwarded to the backend gateway. `host.docker.internal` resolves to the Docker host machine.

### Compression

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript
           application/javascript application/json application/xml+rss;
```

### Error Handling

```nginx
error_page 404 /index.html;
```

404 errors are redirected to `index.html` for client-side routing.

## Production Considerations

### API Gateway URL

In production, the API Gateway URL depends on your infrastructure:

- **Same host**: Use `host.docker.internal:8080` (default in `nginx.conf`)
- **Docker network**: Use service name (e.g., `api-gateway:8080`)
- **External**: Replace with the actual gateway URL

Update `nginx.conf` accordingly:

```nginx
location /api/ {
    proxy_pass http://your-api-gateway:8080;
}
```

### Environment Variables

The Angular production build bakes environment values into the bundle. To change configuration at runtime, consider:

1. Modifying `environment.prod.ts` before building
2. Using a configuration endpoint served by Nginx
3. Using Docker build args for the API URL

### HTTPS

For production with HTTPS:

1. Obtain SSL certificates (e.g., Let's Encrypt)
2. Update `nginx.conf` to listen on port 443 with SSL
3. Add HTTP → HTTPS redirect
4. Update `docker-compose.yml` port mapping

### Performance

- **Gzip** is enabled by default in `nginx.conf`
- **Cache-busting** is handled by Angular's output hashing
- **Lazy loading** reduces initial bundle size
- Monitor bundle size with `npm run analyze`

### Health Check

The Docker Compose configuration includes a health check:

```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:80"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## Deployment Checklist

Before deploying to production:

- [ ] `npm run build:prod` succeeds without errors
- [ ] Bundle size is within budget (< 750KB warning threshold)
- [ ] All unit tests pass (`npm test`)
- [ ] All E2E tests pass (`npm run e2e`)
- [ ] No linting errors (`npm run lint`)
- [ ] `environment.prod.ts` has correct configuration
- [ ] `nginx.conf` points to the correct API Gateway URL
- [ ] Docker image builds successfully
- [ ] Health check passes after container start
- [ ] Both light and dark themes work
- [ ] Both languages (EN/ES) work
- [ ] Authentication flow works end-to-end
- [ ] Cart and checkout flow works end-to-end
