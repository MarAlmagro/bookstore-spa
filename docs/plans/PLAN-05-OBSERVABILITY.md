# Plan 05: Observability & Logging

**Priority**: Medium 🟡  
**Estimated Effort**: 3-4 hours  
**Dependencies**: None

---

## Objective

Implement structured logging, error tracking, and performance monitoring to improve observability.

---

## Tasks

### 1. Create Logging Service

Create `src/app/core/services/logging.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
  error?: Error;
}

@Injectable({ providedIn: 'root' })
export class LoggingService {
  private readonly minLevel = environment.production ? LogLevel.WARN : LogLevel.DEBUG;

  debug(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  info(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  warn(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  error(message: string, error?: Error, context?: string, data?: unknown): void {
    this.log(LogLevel.ERROR, message, context, data, error);
  }

  private log(
    level: LogLevel,
    message: string,
    context?: string,
    data?: unknown,
    error?: Error
  ): void {
    if (level < this.minLevel) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      data,
      error
    };

    this.writeLog(entry);

    // In production, send to remote logging service
    if (environment.production && level >= LogLevel.ERROR) {
      this.sendToRemote(entry);
    }
  }

  private writeLog(entry: LogEntry): void {
    const prefix = `[${LogLevel[entry.level]}]`;
    const contextStr = entry.context ? `[${entry.context}]` : '';
    const fullMessage = `${prefix}${contextStr} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(fullMessage, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(fullMessage, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(fullMessage, entry.data || '');
        break;
      case LogLevel.ERROR:
        console.error(fullMessage, entry.error || entry.data || '');
        break;
    }
  }

  private sendToRemote(entry: LogEntry): void {
    // Implement remote logging (e.g., Sentry, LogRocket, custom endpoint)
    // Example with fetch:
    // fetch('/api/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(entry)
    // }).catch(() => {});
  }
}
```

### 2. Update Services to Use LoggingService

Update `cart.service.ts`:

```typescript
import { LoggingService } from './logging.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly logger = inject(LoggingService);

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.CART_STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored) as CartItem[];
        this._items$.next(items);
        this.logger.debug('Cart loaded from storage', 'CartService', { itemCount: items.length });
      }
    } catch (error) {
      this.logger.error('Failed to load cart from storage', error as Error, 'CartService');
      this._items$.next([]);
    }
  }

  private saveToStorage(items: CartItem[]): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      this.logger.error('Failed to save cart to storage', error as Error, 'CartService');
    }
  }
}
```

Update `theme.service.ts`:

```typescript
import { LoggingService } from './logging.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly logger = inject(LoggingService);

  private saveThemePreference(isDark: boolean): void {
    try {
      localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');
    } catch (error) {
      this.logger.warn('Failed to save theme preference', 'ThemeService', { error });
    }
  }
}
```

### 3. Add Global Error Handler

Create `src/app/core/services/global-error-handler.ts`:

```typescript
import { ErrorHandler, Injectable, inject } from '@angular/core';
import { LoggingService } from './logging.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly logger = inject(LoggingService);

  handleError(error: Error): void {
    // Log the error
    this.logger.error(
      'Unhandled error',
      error,
      'GlobalErrorHandler',
      {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    );

    // Re-throw in development for debugging
    if (!(window as any).production) {
      console.error('Unhandled error:', error);
    }
  }
}
```

Register in `main.ts`:

```typescript
import { ErrorHandler } from '@angular/core';
import { GlobalErrorHandler } from './app/core/services/global-error-handler';

bootstrapApplication(AppComponent, {
  providers: [
    // ... existing providers
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
});
```

### 4. Add Performance Monitoring

Create `src/app/core/services/performance.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { LoggingService } from './logging.service';

@Injectable({ providedIn: 'root' })
export class PerformanceService {
  private readonly logger = inject(LoggingService);
  private readonly marks = new Map<string, number>();

  startMark(name: string): void {
    this.marks.set(name, performance.now());
  }

  endMark(name: string): number {
    const start = this.marks.get(name);
    if (!start) {
      this.logger.warn(`No start mark found for: ${name}`, 'PerformanceService');
      return 0;
    }

    const duration = performance.now() - start;
    this.marks.delete(name);

    this.logger.debug(`Performance: ${name}`, 'PerformanceService', {
      duration: `${duration.toFixed(2)}ms`
    });

    return duration;
  }

  measureCoreWebVitals(): void {
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.logger.info('LCP', 'WebVitals', { value: lastEntry.startTime });
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      // First Input Delay
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.logger.info('FID', 'WebVitals', { value: entry.processingStart - entry.startTime });
        });
      }).observe({ type: 'first-input', buffered: true });

      // Cumulative Layout Shift
      new PerformanceObserver((list) => {
        let cls = 0;
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            cls += entry.value;
          }
        });
        this.logger.info('CLS', 'WebVitals', { value: cls });
      }).observe({ type: 'layout-shift', buffered: true });
    }
  }
}
```

Initialize in `app.component.ts`:

```typescript
export class AppComponent implements OnInit {
  private readonly performanceService = inject(PerformanceService);

  ngOnInit(): void {
    if (environment.production) {
      this.performanceService.measureCoreWebVitals();
    }
  }
}
```

### 5. Add HTTP Request Logging

Create `src/app/core/interceptors/logging.interceptor.ts`:

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { LoggingService } from '../services/logging.service';
import { environment } from '@environments/environment';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  private readonly logger = inject(LoggingService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (environment.production) {
      return next.handle(req);
    }

    const startTime = Date.now();

    return next.handle(req).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            this.logger.debug(
              `${req.method} ${req.urlWithParams}`,
              'HTTP',
              {
                status: event.status,
                duration: `${Date.now() - startTime}ms`
              }
            );
          }
        },
        error: (error) => {
          this.logger.error(
            `${req.method} ${req.urlWithParams} failed`,
            error,
            'HTTP',
            {
              status: error.status,
              duration: `${Date.now() - startTime}ms`
            }
          );
        }
      })
    );
  }
}
```

### 6. Add Health Check Endpoint (Optional)

For monitoring tools, add a simple health check route:

```typescript
// app-routing.module.ts
{
  path: 'health',
  loadComponent: () => import('./shared/components/health/health.component')
    .then(m => m.HealthComponent)
}
```

Create `src/app/shared/components/health/health.component.ts`:

```typescript
import { Component } from '@angular/core';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [JsonPipe],
  template: `<pre>{{ health | json }}</pre>`
})
export class HealthComponent {
  health = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    version: '0.0.0'
  };
}
```

---

## Verification

- [ ] LoggingService created and working
- [ ] Console logs replaced with LoggingService calls
- [ ] GlobalErrorHandler catches unhandled errors
- [ ] Performance metrics logged in production
- [ ] HTTP requests logged in development

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `logging.service.ts` | Create |
| `global-error-handler.ts` | Create |
| `performance.service.ts` | Create |
| `logging.interceptor.ts` | Create |
| `health.component.ts` | Create (optional) |
| `cart.service.ts` | Modify |
| `theme.service.ts` | Modify |
| `main.ts` | Modify |
| `core.module.ts` | Modify |
