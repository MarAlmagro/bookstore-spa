import { inject, Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private isRefreshing = false;

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !req.url.includes('/auth/') && !this.isRefreshing) {
          return this.handle401Error(req, next);
        }

        this.showErrorMessage(error);
        return throwError(() => error);
      })
    );
  }

  private handle401Error(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.isRefreshing = true;

    return this.authService.refreshToken().pipe(
      switchMap(() => {
        this.isRefreshing = false;
        const token = this.authService.getAccessToken();
        if (token) {
          req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
          });
        }
        return next.handle(req);
      }),
      catchError((error) => {
        this.isRefreshing = false;
        this.authService.logout();
        this.showErrorMessage(error);
        return throwError(() => error);
      })
    );
  }

  private showErrorMessage(error: HttpErrorResponse): void {
    let messageKey = 'errors.serverError';

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
    }

    this.translate.get(messageKey).subscribe(message => {
      this.snackBar.open(message, this.translate.instant('common.close'), {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    });
  }
}
