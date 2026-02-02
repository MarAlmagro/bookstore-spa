import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CartSummaryComponent } from './cart-summary.component';

describe('CartSummaryComponent', () => {
  let component: CartSummaryComponent;
  let fixture: ComponentFixture<CartSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CartSummaryComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule
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
    component.itemCount = 5;
    component.canCheckout = true;
    fixture.detectChanges();
    
    const button = fixture.nativeElement.querySelector('[data-testid="cart-summary-checkout-btn"]');
    expect(button.disabled).toBe(false);
  });

  it('should display subtotal', () => {
    component.subtotal = 59.99;
    fixture.detectChanges();
    
    const subtotalElement = fixture.nativeElement.querySelector('[data-testid="cart-summary-subtotal"]');
    expect(subtotalElement.textContent).toContain('59.99');
  });

  it('should display total', () => {
    component.subtotal = 59.99;
    fixture.detectChanges();
    
    const totalElement = fixture.nativeElement.querySelector('[data-testid="cart-summary-total"]');
    expect(totalElement.textContent).toContain('59.99');
  });
});
