import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of, BehaviorSubject } from 'rxjs';
import { OrderListComponent } from './order-list.component';
import { OrdersService } from '../../services';
import { AuthService } from '@app/core/services';
import { Order, User } from '@app/models';

describe('OrderListComponent', () => {
  let component: OrderListComponent;
  let fixture: ComponentFixture<OrderListComponent>;
  let ordersServiceMock: jest.Mocked<Partial<OrdersService>>;
  let authServiceMock: Partial<AuthService>;
  let routerMock: jest.Mocked<Partial<Router>>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'CUSTOMER'
  };

  const mockOrders: Order[] = [
    {
      id: 'order-1',
      userId: 1,
      items: [{ bookId: 1, quantity: 2 }],
      totalAmount: 59.98,
      status: 'CONFIRMED',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 'order-2',
      userId: 1,
      items: [{ bookId: 2, quantity: 1 }],
      totalAmount: 29.99,
      status: 'DELIVERED',
      createdAt: '2024-01-10T14:00:00Z'
    }
  ];

  beforeEach(async () => {
    ordersServiceMock = {
      getUserOrders: jest.fn().mockReturnValue(of(mockOrders))
    };

    authServiceMock = {
      user$: new BehaviorSubject<User | null>(mockUser)
    };

    routerMock = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        OrderListComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: OrdersService, useValue: ordersServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load orders on init', () => {
    expect(ordersServiceMock.getUserOrders).toHaveBeenCalledWith(1);
    
    let orders: Order[] = [];
    component.orders$.subscribe(o => orders = o);
    expect(orders.length).toBe(2);
  });

  it('should set loading to false after orders are loaded', (done) => {
    component.loading$.subscribe(loading => {
      expect(loading).toBe(false);
      done();
    });
  });

  it('should navigate to order detail on onViewDetails', () => {
    component.onViewDetails('order-1');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/orders', 'order-1']);
  });

  it('should navigate to catalog on browseCatalog', () => {
    component.browseCatalog();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/books']);
  });

  it('should track orders by id', () => {
    const order: Order = { id: 'test-id', userId: 1, items: [] };
    expect(component.trackByOrderId(0, order)).toBe('test-id');
  });

  it('should display orders list container', () => {
    fixture.detectChanges();
    const listElement = fixture.nativeElement.querySelector('[data-testid="orders-list"]');
    expect(listElement).toBeTruthy();
  });
});

describe('OrderListComponent - Empty State', () => {
  let fixture: ComponentFixture<OrderListComponent>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'CUSTOMER'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        OrderListComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: OrdersService, useValue: { getUserOrders: jest.fn().mockReturnValue(of([])) } },
        { provide: AuthService, useValue: { user$: new BehaviorSubject<User | null>(mockUser) } },
        { provide: Router, useValue: { navigate: jest.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderListComponent);
    fixture.detectChanges();
  });

  it('should show empty state when no orders', () => {
    fixture.detectChanges();
    const emptyState = fixture.nativeElement.querySelector('[data-testid="orders-empty-state"]');
    expect(emptyState).toBeTruthy();
  });
});

describe('OrderListComponent - No User', () => {
  let ordersServiceMock: jest.Mocked<Partial<OrdersService>>;

  beforeEach(async () => {
    ordersServiceMock = {
      getUserOrders: jest.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [
        OrderListComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: OrdersService, useValue: ordersServiceMock },
        { provide: AuthService, useValue: { user$: new BehaviorSubject<User | null>(null) } },
        { provide: Router, useValue: { navigate: jest.fn() } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(OrderListComponent);
    fixture.detectChanges();
  });

  it('should not load orders when user is null', () => {
    expect(ordersServiceMock.getUserOrders).not.toHaveBeenCalled();
  });
});
