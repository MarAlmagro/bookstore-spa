import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable()
export class MockInterceptor implements HttpInterceptor {
  private readonly mockData = new Map<string, unknown>();

  constructor() {
    if (environment.useMocks) {
      this.loadMockData();
    }
  }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!environment.useMocks) {
      return next.handle(req);
    }

    const mockResponse = this.getMockResponse(req);
    if (mockResponse) {
      return of(new HttpResponse({
        status: 200,
        body: mockResponse
      })).pipe(delay(500));
    }

    return next.handle(req);
  }

  private getMockResponse(req: HttpRequest<unknown>): unknown {
    const url = req.url;

    if (url.includes('/auth/login') || url.includes('/auth/register')) {
      return this.mockData.get('auth-response');
    }

    if (url.includes('/auth/refresh')) {
      return this.mockData.get('auth-response');
    }

    if (url.includes('/books/page')) {
      return this.mockData.get('book-page');
    }

    if (url.includes('/books') && req.method === 'GET') {
      return this.mockData.get('books');
    }

    if (url.includes('/orders') && req.method === 'POST') {
      return {
        id: 'mock-order-' + Date.now(),
        userId: 1,
        items: [],
        totalAmount: 0,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };
    }

    if (url.includes('/orders/user/')) {
      return this.mockData.get('orders');
    }

    if (url.includes('/users/profile')) {
      return this.mockData.get('user');
    }

    return null;
  }

  private loadMockData(): void {
    this.mockData.set('auth-response', {
      token: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: {
        id: 1,
        email: 'customer@example.com',
        firstName: 'Test',
        lastName: 'Customer',
        role: 'CUSTOMER'
      }
    });

    this.mockData.set('books', [
      {
        id: 1,
        isbn: '9780134685991',
        title: 'Effective Java',
        author: 'Joshua Bloch',
        description: 'The definitive guide to Java best practices',
        price: 45.99,
        stock: 50,
        category: 'Programming'
      },
      {
        id: 2,
        isbn: '9780596517748',
        title: 'JavaScript: The Good Parts',
        author: 'Douglas Crockford',
        description: 'Unearthing the excellence in JavaScript',
        price: 29.99,
        stock: 30,
        category: 'Programming'
      }
    ]);

    this.mockData.set('book-page', {
      content: this.mockData.get('books'),
      page: 0,
      size: 20,
      totalElements: 2,
      totalPages: 1,
      first: true,
      last: true
    });

    this.mockData.set('orders', []);

    this.mockData.set('user', {
      id: 1,
      email: 'customer@example.com',
      firstName: 'Test',
      lastName: 'Customer',
      role: 'CUSTOMER'
    });
  }
}
