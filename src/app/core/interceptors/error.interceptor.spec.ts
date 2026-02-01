import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ErrorInterceptor } from './error.interceptor';
import { AuthService } from '../services/auth.service';

describe('ErrorInterceptor', () => {
  let interceptor: ErrorInterceptor;
  let authServiceMock: Partial<AuthService>;
  let snackBarMock: Partial<MatSnackBar>;
  let translateMock: Partial<TranslateService>;
  let httpHandlerMock: Partial<HttpHandler>;

  beforeEach(() => {
    authServiceMock = {
      refreshToken: jest.fn().mockReturnValue(of({})),
      getAccessToken: jest.fn().mockReturnValue('new-token'),
      logout: jest.fn()
    };

    snackBarMock = {
      open: jest.fn()
    };

    translateMock = {
      get: jest.fn().mockReturnValue(of('Error message')),
      instant: jest.fn().mockReturnValue('Close')
    };

    httpHandlerMock = {
      handle: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        ErrorInterceptor,
        { provide: AuthService, useValue: authServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: TranslateService, useValue: translateMock }
      ]
    });

    interceptor = TestBed.inject(ErrorInterceptor);
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should show snackbar for 400 error', (done) => {
    const request = new HttpRequest('GET', '/api/v1/books');
    const error = new HttpErrorResponse({ status: 400 });
    (httpHandlerMock.handle as jest.Mock).mockReturnValue(throwError(() => error));

    interceptor.intercept(request, httpHandlerMock as HttpHandler).subscribe({
      error: () => {
        expect(translateMock.get).toHaveBeenCalledWith('errors.badRequest');
        expect(snackBarMock.open).toHaveBeenCalled();
        done();
      }
    });
  });

  it('should show snackbar for 404 error', (done) => {
    const request = new HttpRequest('GET', '/api/v1/books/999');
    const error = new HttpErrorResponse({ status: 404 });
    (httpHandlerMock.handle as jest.Mock).mockReturnValue(throwError(() => error));

    interceptor.intercept(request, httpHandlerMock as HttpHandler).subscribe({
      error: () => {
        expect(translateMock.get).toHaveBeenCalledWith('errors.notFound');
        done();
      }
    });
  });

  it('should attempt token refresh on 401 error', (done) => {
    const request = new HttpRequest('GET', '/api/v1/orders');
    const error = new HttpErrorResponse({ status: 401 });
    (httpHandlerMock.handle as jest.Mock)
      .mockReturnValueOnce(throwError(() => error))
      .mockReturnValueOnce(of({}));

    interceptor.intercept(request, httpHandlerMock as HttpHandler).subscribe({
      next: () => {
        expect(authServiceMock.refreshToken).toHaveBeenCalled();
        done();
      }
    });
  });

  it('should not refresh token for auth endpoints', (done) => {
    const request = new HttpRequest('POST', '/api/v1/auth/login');
    const error = new HttpErrorResponse({ status: 401 });
    (httpHandlerMock.handle as jest.Mock).mockReturnValue(throwError(() => error));

    interceptor.intercept(request, httpHandlerMock as HttpHandler).subscribe({
      error: () => {
        expect(authServiceMock.refreshToken).not.toHaveBeenCalled();
        done();
      }
    });
  });

  it('should logout if token refresh fails', (done) => {
    const request = new HttpRequest('GET', '/api/v1/orders');
    const error = new HttpErrorResponse({ status: 401 });
    (authServiceMock.refreshToken as jest.Mock).mockReturnValue(throwError(() => error));
    (httpHandlerMock.handle as jest.Mock).mockReturnValue(throwError(() => error));

    interceptor.intercept(request, httpHandlerMock as HttpHandler).subscribe({
      error: () => {
        expect(authServiceMock.logout).toHaveBeenCalled();
        done();
      }
    });
  });
});
