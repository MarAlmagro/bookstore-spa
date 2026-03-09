import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { OrderCardComponent } from './order-card.component';
import { Order } from '@app/models';

describe('OrderCardComponent', () => {
  let component: OrderCardComponent;
  let fixture: ComponentFixture<OrderCardComponent>;

  const mockOrder: Order = {
    id: 'order-123-abc',
    userId: 1,
    items: [
      { bookId: 1, quantity: 2, price: 29.99, bookTitle: 'Book 1' },
      { bookId: 2, quantity: 1, price: 19.99, bookTitle: 'Book 2' }
    ],
    totalAmount: 79.97,
    status: 'CONFIRMED',
    createdAt: '2024-01-15T10:30:00Z'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        OrderCardComponent,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderCardComponent);
    component = fixture.componentInstance;
    component.order = mockOrder;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate item count correctly', () => {
    expect(component.itemCount).toBe(3);
  });

  it('should format date correctly', () => {
    expect(component.formattedDate).toBeTruthy();
    expect(component.formattedDate).toContain('2024');
  });

  it('should return empty string for undefined createdAt', () => {
    component.order = { ...mockOrder, createdAt: undefined };
    expect(component.formattedDate).toBe('');
  });

  it('should emit viewDetails with order id when onViewDetails is called', () => {
    const spy = jest.spyOn(component.viewDetails, 'emit');
    component.onViewDetails();
    expect(spy).toHaveBeenCalledWith('order-123-abc');
  });

  it('should display order card with correct data-testid', () => {
    const cardElement = fixture.nativeElement.querySelector('[data-testid="order-card-order-123-abc"]');
    expect(cardElement).toBeTruthy();
  });

  it('should display item count', () => {
    const itemCountElement = fixture.nativeElement.querySelector('[data-testid="order-card-order-123-abc-item-count"]');
    expect(itemCountElement.textContent).toContain('3');
  });

  it('should display total amount', () => {
    const totalElement = fixture.nativeElement.querySelector('[data-testid="order-card-order-123-abc-total"]');
    expect(totalElement.textContent).toContain('79.97');
  });

  it('should display view details button', () => {
    const viewBtn = fixture.nativeElement.querySelector('[data-testid="order-card-order-123-abc-view-btn"]');
    expect(viewBtn).toBeTruthy();
  });

  it('should emit viewDetails when view button is clicked', () => {
    const spy = jest.spyOn(component.viewDetails, 'emit');
    const viewBtn = fixture.nativeElement.querySelector('[data-testid="order-card-order-123-abc-view-btn"]');
    viewBtn.click();
    expect(spy).toHaveBeenCalledWith('order-123-abc');
  });
});
