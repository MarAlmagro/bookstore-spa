import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, of } from 'rxjs';
import { CheckoutComponent } from './checkout.component';
import { CartService } from '@app/core/services/cart.service';
import { AuthService } from '@app/core/services/auth.service';
import { OrdersService } from '../../../orders/services/orders.service';
import { CartItem, User, Order } from '@app/models';

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let cartServiceMock: Partial<CartService>;
  let authServiceMock: Partial<AuthService>;
  let ordersServiceMock: Partial<OrdersService>;
  let routerMock: Partial<Router>;
  let snackBarMock: Partial<MatSnackBar>;
  let itemsSubject: BehaviorSubject<CartItem[]>;

  const mockUser: User = {
    id: 1,
    email: 'test@test.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'CUSTOMER'
  };

  const mockCartItems: CartItem[] = [
    {
      book: {
        id: 1,
        isbn: '978-0-13-468599-1',
        title: 'Test Book',
        author: 'Author',
        price: 29.99,
        stock: 10,
        category: 'Fiction'
      },
      quantity: 2
    }
  ];

  const mockOrder: Order = {
    id: 'order-123',
    userId: 1,
    items: [{ bookId: 1, quantity: 2 }],
    totalAmount: 59.98,
    status: 'PENDING'
  };

  beforeEach(async () => {
    itemsSubject = new BehaviorSubject<CartItem[]>(mockCartItems);

    cartServiceMock = {
      items$: itemsSubject.asObservable(),
      total$: new BehaviorSubject<number>(59.98).asObservable(),
      clear: jest.fn()
    };

    authServiceMock = {
      user$: new BehaviorSubject<User | null>(mockUser).asObservable()
    };

    ordersServiceMock = {
      createOrder: jest.fn().mockReturnValue(of(mockOrder))
    };

    routerMock = {
      navigate: jest.fn()
    };

    snackBarMock = {
      open: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        CheckoutComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: CartService, useValue: cartServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: OrdersService, useValue: ordersServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatSnackBar, useValue: snackBarMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to cart if cart is empty on init', (done) => {
    itemsSubject.next([]);
    component.ngOnInit();
    setTimeout(() => {
      expect(routerMock.navigate).toHaveBeenCalledWith(['/cart']);
      done();
    }, 0);
  });

  it('should display order items', () => {
    const itemList = fixture.nativeElement.querySelector('[data-testid="checkout-item-list"]');
    expect(itemList).toBeTruthy();
  });

  it('should display total', () => {
    const totalElement = fixture.nativeElement.querySelector('[data-testid="checkout-total"]');
    expect(totalElement.textContent).toContain('59.98');
  });

  it('should call createOrder on confirm', () => {
    component.onConfirmOrder();
    
    // Verify the loading state is set
    expect(component.loading$.value).toBe(true);
    // Verify createOrder was called (the observable subscription handles the rest)
    expect(ordersServiceMock.createOrder).toHaveBeenCalled();
  });

  it('should set loading to true when confirming order', () => {
    component.onConfirmOrder();
    expect(component.loading$.value).toBe(true);
  });

  it('should navigate back to cart on goBack', () => {
    component.goBack();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cart']);
  });
});
