import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { OrdersService } from './orders.service';
import { Order, CreateOrderRequest } from '@app/models';
import { environment } from '@environments/environment';

describe('OrdersService', () => {
  let service: OrdersService;
  let httpMock: HttpTestingController;

  const mockOrder: Order = {
    id: 'order-123',
    userId: 1,
    items: [
      { bookId: 1, quantity: 2, price: 29.99 }
    ],
    totalAmount: 59.98,
    status: 'PENDING',
    createdAt: '2024-01-15T10:00:00Z'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), OrdersService]
    });
    service = TestBed.inject(OrdersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createOrder', () => {
    it('should create an order', () => {
      const createRequest: CreateOrderRequest = {
        userId: 1,
        items: [{ bookId: 1, quantity: 2 }]
      };

      service.createOrder(createRequest).subscribe(order => {
        expect(order).toEqual(mockOrder);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/orders`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockOrder);
    });
  });

  describe('getOrderById', () => {
    it('should get order by id', () => {
      service.getOrderById('order-123').subscribe(order => {
        expect(order).toEqual(mockOrder);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/orders/order-123`);
      expect(req.request.method).toBe('GET');
      req.flush(mockOrder);
    });
  });

  describe('getUserOrders', () => {
    it('should get user orders', () => {
      const mockOrders: Order[] = [mockOrder];

      service.getUserOrders(1).subscribe(orders => {
        expect(orders).toEqual(mockOrders);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/orders/user/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockOrders);
    });
  });
});
