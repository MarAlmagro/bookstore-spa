import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CartSummaryComponent } from './cart-summary.component';

describe('CartSummaryComponent', () => {
  let component: CartSummaryComponent;
  let fixture: ComponentFixture<CartSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CartSummaryComponent,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CartSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate total correctly', () => {
    component.subtotal = 100;
    expect(component.total).toBe(100);
  });

  it('should emit checkout event on checkout click', () => {
    const spy = jest.spyOn(component.checkout, 'emit');
    component.onCheckout();
    expect(spy).toHaveBeenCalled();
  });

  it('should disable checkout button when itemCount is 0', () => {
    component.itemCount = 0;
    component.canCheckout = true;
    fixture.detectChanges();
    
    const button = fixture.nativeElement.querySelector('[data-testid="cart-summary-checkout-btn"]');
    expect(button.disabled).toBe(true);
  });

  it('should disable checkout button when canCheckout is false', () => {
    component.itemCount = 5;
    component.canCheckout = false;
    fixture.detectChanges();
    
    const button = fixture.nativeElement.querySelector('[data-testid="cart-summary-checkout-btn"]');
    expect(button.disabled).toBe(true);
  });

  it('should enable checkout button when itemCount > 0 and canCheckout is true', () => {
    fixture.componentRef.setInput('itemCount', 5);
    fixture.componentRef.setInput('canCheckout', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('[data-testid="cart-summary-checkout-btn"]');
    expect(button.disabled).toBe(false);
  });

  it('should display subtotal', () => {
    fixture.componentRef.setInput('subtotal', 59.99);
    fixture.detectChanges();

    const subtotalElement = fixture.nativeElement.querySelector('[data-testid="cart-summary-subtotal"]');
    expect(subtotalElement.textContent).toContain('59.99');
  });

  it('should display total', () => {
    fixture.componentRef.setInput('subtotal', 59.99);
    fixture.detectChanges();

    const totalElement = fixture.nativeElement.querySelector('[data-testid="cart-summary-total"]');
    expect(totalElement.textContent).toContain('59.99');
  });
});
