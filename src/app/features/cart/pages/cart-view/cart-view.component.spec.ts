import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { CartViewComponent } from './cart-view.component';
import { CartService } from '@app/core/services/cart.service';
import { CartItem } from '@app/models';

describe('CartViewComponent', () => {
  let component: CartViewComponent;
  let fixture: ComponentFixture<CartViewComponent>;
  let cartServiceMock: Partial<CartService>;
  let routerMock: Partial<Router>;
  let itemsSubject: BehaviorSubject<CartItem[]>;

  const mockCartItems: CartItem[] = [
    {
      book: {
        id: 1,
        isbn: '978-0-13-468599-1',
        title: 'Test Book 1',
        author: 'Author 1',
        price: 29.99,
        stock: 10,
        category: 'Fiction'
      },
      quantity: 2
    },
    {
      book: {
        id: 2,
        isbn: '978-0-13-468599-2',
        title: 'Test Book 2',
        author: 'Author 2',
        price: 19.99,
        stock: 5,
        category: 'Tech'
      },
      quantity: 1
    }
  ];

  beforeEach(async () => {
    itemsSubject = new BehaviorSubject<CartItem[]>(mockCartItems);
    
    cartServiceMock = {
      items$: itemsSubject.asObservable(),
      itemCount$: new BehaviorSubject<number>(3).asObservable(),
      total$: new BehaviorSubject<number>(79.97).asObservable(),
      updateQuantity: jest.fn(),
      removeItem: jest.fn()
    };

    routerMock = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        CartViewComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: CartService, useValue: cartServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CartViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display cart items', () => {
    const cartItems = fixture.nativeElement.querySelectorAll('app-cart-item');
    expect(cartItems.length).toBe(2);
  });

  it('should call updateQuantity on quantity change', () => {
    component.onQuantityChange({ bookId: 1, quantity: 3 });
    expect(cartServiceMock.updateQuantity).toHaveBeenCalledWith(1, 3);
  });

  it('should call removeItem on remove', () => {
    component.onRemove(1);
    expect(cartServiceMock.removeItem).toHaveBeenCalledWith(1);
  });

  it('should navigate to checkout on checkout', () => {
    component.onCheckout();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cart/checkout']);
  });

  it('should navigate to books on browse catalog', () => {
    component.browseCatalog();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/books']);
  });

  it('should show empty state when cart is empty', () => {
    itemsSubject.next([]);
    fixture.detectChanges();
    
    const emptyState = fixture.nativeElement.querySelector('[data-testid="cart-empty-state"]');
    expect(emptyState).toBeTruthy();
  });

  it('should track items by book id', () => {
    const result = component.trackByBookId(0, mockCartItems[0]);
    expect(result).toBe(1);
  });
});
