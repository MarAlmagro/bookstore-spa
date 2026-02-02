import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { OrderDetailComponent } from './order-detail.component';
import { OrdersService } from '../../services';
import { Order } from '@app/models';

describe('OrderDetailComponent', () => {
  let component: OrderDetailComponent;
  let fixture: ComponentFixture<OrderDetailComponent>;
  let ordersServiceMock: jest.Mocked<Partial<OrdersService>>;
  let locationMock: jest.Mocked<Partial<Location>>;

  const mockOrder: Order = {
    id: 'order-123',
    userId: 1,
    items: [
      { bookId: 1, quantity: 2, price: 29.99, bookTitle: 'Book 1', bookIsbn: '978-1234567890' },
      { bookId: 2, quantity: 1, price: 19.99, bookTitle: 'Book 2', bookIsbn: '978-0987654321' }
    ],
    totalAmount: 79.97,
    status: 'CONFIRMED',
    createdAt: '2024-01-15T10:30:00Z'
  };

  beforeEach(async () => {
    ordersServiceMock = {
      getOrderById: jest.fn().mockReturnValue(of(mockOrder))
    };

    locationMock = {
      back: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        OrderDetailComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: OrdersService, useValue: ordersServiceMock },
        { provide: Location, useValue: locationMock },
        { provide: ActivatedRoute, useValue: { params: of({ id: 'order-123' }) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load order from route params', () => {
    expect(ordersServiceMock.getOrderById).toHaveBeenCalledWith('order-123');
  });

  it('should call location.back() on goBack', () => {
    component.goBack();
    expect(locationMock.back).toHaveBeenCalled();
  });

  it('should format date correctly', () => {
    const formatted = component.formatDate('2024-01-15T10:30:00Z');
    expect(formatted).toBeTruthy();
    expect(formatted).toContain('2024');
  });

  it('should return empty string for undefined date', () => {
    expect(component.formatDate(undefined)).toBe('');
  });

  it('should display order detail container', () => {
    const container = fixture.nativeElement.querySelector('[data-testid="order-detail-container"]');
    expect(container).toBeTruthy();
  });

  it('should display back button', () => {
    const backBtn = fixture.nativeElement.querySelector('[data-testid="order-detail-back-btn"]');
    expect(backBtn).toBeTruthy();
  });

  it('should navigate back when back button is clicked', () => {
    const backBtn = fixture.nativeElement.querySelector('[data-testid="order-detail-back-btn"]');
    backBtn.click();
    expect(locationMock.back).toHaveBeenCalled();
  });

  it('should display order items', () => {
    const itemsContainer = fixture.nativeElement.querySelector('[data-testid="order-detail-items"]');
    expect(itemsContainer).toBeTruthy();
  });

  it('should display total amount', () => {
    const totalElement = fixture.nativeElement.querySelector('[data-testid="order-detail-total"]');
    expect(totalElement).toBeTruthy();
    expect(totalElement.textContent).toContain('79.97');
  });

  it('should set loading to false after order is loaded', (done) => {
    component.loading$.subscribe(loading => {
      expect(loading).toBe(false);
      done();
    });
  });
});
