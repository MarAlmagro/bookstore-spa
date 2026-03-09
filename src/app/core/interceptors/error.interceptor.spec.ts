import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ErrorInterceptor } from './error.interceptor';
import { AuthService } from '../services/auth.service';

describe('ErrorInterceptor', () => {
  let interceptor: ErrorInterceptor;
  let authServiceMock: { refreshToken: jest.Mock; getAccessToken: jest.Mock; logout: jest.Mock };
  let snackBarMock: { open: jest.Mock };
  let translateMock: { get: jest.Mock; instant: jest.Mock };
  let httpHandlerMock: { handle: jest.Mock };

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
    const request = new HttpRequest<unknown>('GET', '/api/v1/books');
    const error = new HttpErrorResponse({ status: 400 });
    httpHandlerMock.handle.mockReturnValue(throwError(() => error));

    interceptor.intercept(request, httpHandlerMock as unknown as HttpHandler).subscribe({
      error: () => {
        expect(translateMock.get).toHaveBeenCalledWith('errors.badRequest');
        expect(snackBarMock.open).toHaveBeenCalled();
        done();
      }
    });
  });

  it('should show snackbar for 404 error', (done) => {
    const request = new HttpRequest<unknown>('GET', '/api/v1/books/999');
    const error = new HttpErrorResponse({ status: 404 });
    httpHandlerMock.handle.mockReturnValue(throwError(() => error));

    interceptor.intercept(request, httpHandlerMock as unknown as HttpHandler).subscribe({
      error: () => {
        expect(translateMock.get).toHaveBeenCalledWith('errors.notFound');
        done();
      }
    });
  });

  it('should attempt token refresh on 401 error', (done) => {
    const request = new HttpRequest<unknown>('GET', '/api/v1/orders');
    const error = new HttpErrorResponse({ status: 401 });
    httpHandlerMock.handle
      .mockReturnValueOnce(throwError(() => error))
      .mockReturnValueOnce(of({}));

    interceptor.intercept(request, httpHandlerMock as unknown as HttpHandler).subscribe({
      next: () => {
        expect(authServiceMock.refreshToken).toHaveBeenCalled();
        done();
      }
    });
  });

  it('should not refresh token for auth endpoints', (done) => {
    const request = new HttpRequest<unknown>('POST', '/api/v1/auth/login', {});
    const error = new HttpErrorResponse({ status: 401 });
    httpHandlerMock.handle.mockReturnValue(throwError(() => error));

    interceptor.intercept(request, httpHandlerMock as unknown as HttpHandler).subscribe({
      error: () => {
        expect(authServiceMock.refreshToken).not.toHaveBeenCalled();
        done();
      }
    });
  });

  it('should logout if token refresh fails', (done) => {
    const request = new HttpRequest<unknown>('GET', '/api/v1/orders');
    const error = new HttpErrorResponse({ status: 401 });
    authServiceMock.refreshToken.mockReturnValue(throwError(() => error));
    httpHandlerMock.handle.mockReturnValue(throwError(() => error));

    interceptor.intercept(request, httpHandlerMock as unknown as HttpHandler).subscribe({
      error: () => {
        expect(authServiceMock.logout).toHaveBeenCalled();
        done();
      }
    });
  });

  it('should show snackbar for 403 forbidden error', (done) => {
    const request = new HttpRequest<unknown>('GET', '/api/v1/admin');
    const error = new HttpErrorResponse({ status: 403 });
    httpHandlerMock.handle.mockReturnValue(throwError(() => error));

    interceptor.intercept(request, httpHandlerMock as unknown as HttpHandler).subscribe({
      error: () => {
        expect(translateMock.get).toHaveBeenCalledWith('errors.forbidden');
        expect(snackBarMock.open).toHaveBeenCalled();
        done();
      }
    });
  });

  it('should show snackbar for network error (status 0)', (done) => {
    const request = new HttpRequest<unknown>('GET', '/api/v1/books');
    const error = new HttpErrorResponse({ status: 0 });
    httpHandlerMock.handle.mockReturnValue(throwError(() => error));

    interceptor.intercept(request, httpHandlerMock as unknown as HttpHandler).subscribe({
      error: () => {
        expect(translateMock.get).toHaveBeenCalledWith('errors.networkError');
        expect(snackBarMock.open).toHaveBeenCalled();
        done();
      }
    });
  });

  it('should show snackbar for default server error (status 500)', (done) => {
    const request = new HttpRequest<unknown>('GET', '/api/v1/books');
    const error = new HttpErrorResponse({ status: 500 });
    httpHandlerMock.handle.mockReturnValue(throwError(() => error));

    interceptor.intercept(request, httpHandlerMock as unknown as HttpHandler).subscribe({
      error: () => {
        expect(translateMock.get).toHaveBeenCalledWith('errors.serverError');
        expect(snackBarMock.open).toHaveBeenCalled();
        done();
      }
    });
  });

  it('should show snackbar for 401 error on auth endpoints', (done) => {
    const request = new HttpRequest<unknown>('POST', '/api/v1/auth/login', {});
    const error = new HttpErrorResponse({ status: 401 });
    httpHandlerMock.handle.mockReturnValue(throwError(() => error));

    interceptor.intercept(request, httpHandlerMock as unknown as HttpHandler).subscribe({
      error: () => {
        expect(translateMock.get).toHaveBeenCalledWith('errors.unauthorized');
        expect(snackBarMock.open).toHaveBeenCalled();
        done();
      }
    });
  });

  it('should retry request without token when refresh returns no token', (done) => {
    const request = new HttpRequest<unknown>('GET', '/api/v1/orders');
    const error = new HttpErrorResponse({ status: 401 });
    authServiceMock.getAccessToken.mockReturnValue(null);
    httpHandlerMock.handle
      .mockReturnValueOnce(throwError(() => error))
      .mockReturnValueOnce(of({}));

    interceptor.intercept(request, httpHandlerMock as unknown as HttpHandler).subscribe({
      next: () => {
        expect(authServiceMock.refreshToken).toHaveBeenCalled();
        const retryReq = httpHandlerMock.handle.mock.calls[1][0] as HttpRequest<unknown>;
        expect(retryReq.headers.has('Authorization')).toBe(false);
        done();
      }
    });
  });
});
