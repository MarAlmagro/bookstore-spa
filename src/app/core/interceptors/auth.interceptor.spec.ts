import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('AuthInterceptor', () => {
  let interceptor: AuthInterceptor;
  let authServiceMock: jest.Mocked<AuthService>;
  let httpHandlerMock: jest.Mocked<HttpHandler>;

  beforeEach(() => {
    authServiceMock = {
      getAccessToken: jest.fn()
    } as any;

    httpHandlerMock = {
      handle: jest.fn().mockReturnValue(of({} as HttpEvent<unknown>))
    } as any;

    TestBed.configureTestingModule({
      providers: [
        AuthInterceptor,
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    interceptor = TestBed.inject(AuthInterceptor);
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should add Authorization header when token exists', () => {
    authServiceMock.getAccessToken.mockReturnValue('test-token');
    const request = new HttpRequest('GET', '/api/v1/books');

    interceptor.intercept(request, httpHandlerMock).subscribe();

    expect(httpHandlerMock.handle).toHaveBeenCalled();
    const modifiedRequest = httpHandlerMock.handle.mock.calls[0][0] as HttpRequest<unknown>;
    expect(modifiedRequest.headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('should not add Authorization header when token is null', () => {
    authServiceMock.getAccessToken.mockReturnValue(null);
    const request = new HttpRequest('GET', '/api/v1/books');

    interceptor.intercept(request, httpHandlerMock).subscribe();

    expect(httpHandlerMock.handle).toHaveBeenCalled();
    const modifiedRequest = httpHandlerMock.handle.mock.calls[0][0] as HttpRequest<unknown>;
    expect(modifiedRequest.headers.has('Authorization')).toBe(false);
  });

  it('should not add Authorization header for auth endpoints', () => {
    authServiceMock.getAccessToken.mockReturnValue('test-token');
    const request = new HttpRequest('POST', '/api/v1/auth/login');

    interceptor.intercept(request, httpHandlerMock).subscribe();

    expect(httpHandlerMock.handle).toHaveBeenCalled();
    const modifiedRequest = httpHandlerMock.handle.mock.calls[0][0] as HttpRequest<unknown>;
    expect(modifiedRequest.headers.has('Authorization')).toBe(false);
  });
});
