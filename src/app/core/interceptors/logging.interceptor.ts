import { Injectable, inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
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
