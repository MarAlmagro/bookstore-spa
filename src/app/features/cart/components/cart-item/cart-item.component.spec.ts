import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { CartItemComponent } from './cart-item.component';
import { CartItem } from '@app/models';

describe('CartItemComponent', () => {
  let component: CartItemComponent;
  let fixture: ComponentFixture<CartItemComponent>;

  const mockCartItem: CartItem = {
    book: {
      id: 1,
      isbn: '978-0-13-468599-1',
      title: 'Test Book',
      author: 'Test Author',
      price: 29.99,
      stock: 10,
      category: 'Fiction'
    },
    quantity: 2
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CartItemComponent,
        TranslateModule.forRoot(),
        CommonModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CartItemComponent);
    component = fixture.componentInstance;
    component.item = mockCartItem;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate subtotal correctly', () => {
    expect(component.subtotal).toBe(59.98);
  });

  it('should emit quantityChange with increased quantity on increase', () => {
    const spy = jest.spyOn(component.quantityChange, 'emit');
    component.onIncrease();
    expect(spy).toHaveBeenCalledWith({ bookId: 1, quantity: 3 });
  });

  it('should emit quantityChange with decreased quantity on decrease', () => {
    const spy = jest.spyOn(component.quantityChange, 'emit');
    component.onDecrease();
    expect(spy).toHaveBeenCalledWith({ bookId: 1, quantity: 1 });
  });

  it('should not emit quantityChange when quantity is 1 and decrease is called', () => {
    component.item = { ...mockCartItem, quantity: 1 };
    const spy = jest.spyOn(component.quantityChange, 'emit');
    component.onDecrease();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit remove with bookId on remove', () => {
    const spy = jest.spyOn(component.remove, 'emit');
    component.onRemove();
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('should display item title', () => {
    const titleElement = fixture.nativeElement.querySelector('[data-testid="cart-item-1-title"]');
    expect(titleElement.textContent.trim()).toBe('Test Book');
  });

  it('should display correct quantity', () => {
    const qtyElement = fixture.nativeElement.querySelector('[data-testid="cart-item-1-qty-input"]');
    expect(qtyElement.textContent.trim()).toBe('2');
  });
});
