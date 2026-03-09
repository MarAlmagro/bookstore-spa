import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandler, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { MockInterceptor } from './mock.interceptor';
import * as env from '@environments/environment';

describe('MockInterceptor', () => {
  let interceptor: MockInterceptor;
  let httpHandlerMock: { handle: jest.Mock };

  beforeEach(() => {
    httpHandlerMock = {
      handle: jest.fn().mockReturnValue(of({}))
    };
  });

  afterEach(() => {
    (env.environment as Record<string, unknown>)['useMocks'] = false;
  });

  describe('when mocks disabled', () => {
    beforeEach(() => {
      (env.environment as Record<string, unknown>)['useMocks'] = false;
      TestBed.configureTestingModule({ providers: [MockInterceptor] });
      interceptor = TestBed.inject(MockInterceptor);
    });

    it('should be created', () => {
      expect(interceptor).toBeTruthy();
    });

    it('should pass through when mocks disabled', (done) => {
      const request = new HttpRequest('GET', '/api/v1/books');
      interceptor.intercept(request, httpHandlerMock as HttpHandler).subscribe(() => {
        expect(httpHandlerMock.handle).toHaveBeenCalledWith(request);
        done();
      });
    });
  });

  describe('when mocks enabled', () => {
    beforeEach(() => {
      (env.environment as Record<string, unknown>)['useMocks'] = true;
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers: [MockInterceptor] });
      interceptor = TestBed.inject(MockInterceptor);
    });

    it('should return mock auth response for login', (done) => {
      const request = new HttpRequest('POST', '/api/v1/auth/login', {});
      interceptor.intercept(request, httpHandlerMock as HttpHandler).subscribe(event => {
        if (event instanceof HttpResponse) {
          expect(event.status).toBe(200);
          expect((event.body as Record<string, unknown>)['token']).toBe('mock-access-token');
        }
        done();
      });
    });

    it('should return mock auth response for register', (done) => {
      const request = new HttpRequest('POST', '/api/v1/auth/register', {});
      interceptor.intercept(request, httpHandlerMock as HttpHandler).subscribe(event => {
        if (event instanceof HttpResponse) {
          expect(event.status).toBe(200);
          expect((event.body as Record<string, unknown>)['token']).toBeTruthy();
        }
        done();
      });
    });

    it('should return mock auth response for refresh', (done) => {
      const request = new HttpRequest('POST', '/api/v1/auth/refresh', {});
      interceptor.intercept(request, httpHandlerMock as HttpHandler).subscribe(event => {
        if (event instanceof HttpResponse) {
          expect(event.status).toBe(200);
          expect((event.body as Record<string, unknown>)['token']).toBeTruthy();
        }
        done();
      });
    });

    it('should return mock paginated books for /books/page', (done) => {
      const request = new HttpRequest('GET', '/api/v1/books/page');
      interceptor.intercept(request, httpHandlerMock as HttpHandler).subscribe(event => {
        if (event instanceof HttpResponse) {
          expect(event.status).toBe(200);
          expect((event.body as Record<string, unknown>)['content']).toBeTruthy();
        }
        done();
      });
    });

    it('should return mock books for GET /books', (done) => {
      const request = new HttpRequest('GET', '/api/v1/books');
      interceptor.intercept(request, httpHandlerMock as HttpHandler).subscribe(event => {
        if (event instanceof HttpResponse) {
          expect(event.status).toBe(200);
          expect(Array.isArray(event.body)).toBe(true);
        }
        done();
      });
    });

    it('should return mock order for POST /orders', (done) => {
      const request = new HttpRequest('POST', '/api/v1/orders', {});
      interceptor.intercept(request, httpHandlerMock as HttpHandler).subscribe(event => {
        if (event instanceof HttpResponse) {
          expect(event.status).toBe(200);
          expect((event.body as Record<string, unknown>)['status']).toBe('PENDING');
        }
        done();
      });
    });

    it('should return mock orders for /orders/user/', (done) => {
      const request = new HttpRequest('GET', '/api/v1/orders/user/1');
      interceptor.intercept(request, httpHandlerMock as HttpHandler).subscribe(event => {
        if (event instanceof HttpResponse) {
          expect(event.status).toBe(200);
          expect(Array.isArray(event.body)).toBe(true);
        }
        done();
      });
    });

    it('should return mock user for /users/profile', (done) => {
      const request = new HttpRequest('GET', '/api/v1/users/profile');
      interceptor.intercept(request, httpHandlerMock as HttpHandler).subscribe(event => {
        if (event instanceof HttpResponse) {
          expect(event.status).toBe(200);
          expect((event.body as Record<string, unknown>)['email']).toBe('customer@example.com');
        }
        done();
      });
    });

    it('should pass through for unrecognized URLs', (done) => {
      const request = new HttpRequest('GET', '/api/v1/unknown');
      interceptor.intercept(request, httpHandlerMock as HttpHandler).subscribe(() => {
        expect(httpHandlerMock.handle).toHaveBeenCalledWith(request);
        done();
      });
    });
  });
});
