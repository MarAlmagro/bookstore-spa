import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { OrderStatusBadgeComponent } from './order-status-badge.component';
import { OrderStatus } from '@app/models';

describe('OrderStatusBadgeComponent', () => {
  let component: OrderStatusBadgeComponent;
  let fixture: ComponentFixture<OrderStatusBadgeComponent>;

  const createComponent = (status: OrderStatus = 'PENDING') => {
    fixture = TestBed.createComponent(OrderStatusBadgeComponent);
    component = fixture.componentInstance;
    component.status = status;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        OrderStatusBadgeComponent,
        TranslateModule.forRoot()
      ]
    }).compileComponents();
  });

  it('should create', () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  it('should default to PENDING status', () => {
    createComponent();
    expect(component.status).toBe('PENDING');
  });

  describe('status configurations', () => {
    it('should return correct config for PENDING status', () => {
      createComponent('PENDING');
      expect(component.config.icon).toBe('schedule');
      expect(component.config.class).toBe('status-pending');
    });

    it('should return correct config for CONFIRMED status', () => {
      createComponent('CONFIRMED');
      expect(component.config.icon).toBe('check_circle');
      expect(component.config.class).toBe('status-confirmed');
    });

    it('should return correct config for SHIPPED status', () => {
      createComponent('SHIPPED');
      expect(component.config.icon).toBe('local_shipping');
      expect(component.config.class).toBe('status-shipped');
    });

    it('should return correct config for DELIVERED status', () => {
      createComponent('DELIVERED');
      expect(component.config.icon).toBe('inventory');
      expect(component.config.class).toBe('status-delivered');
    });

    it('should return correct config for CANCELLED status', () => {
      createComponent('CANCELLED');
      expect(component.config.icon).toBe('cancel');
      expect(component.config.class).toBe('status-cancelled');
    });

    it('should apply correct class for status', () => {
      createComponent('CONFIRMED');
      const badgeElement = fixture.nativeElement.querySelector('.status-badge');
      expect(badgeElement.classList.contains('status-confirmed')).toBe(true);
    });

    it('should display correct icon for status', () => {
      createComponent('SHIPPED');
      const iconElement = fixture.nativeElement.querySelector('mat-icon');
      expect(iconElement.textContent.trim()).toBe('local_shipping');
    });
  });

  it('should have data-testid attribute with status', () => {
    createComponent('SHIPPED');
    const badgeElement = fixture.nativeElement.querySelector('[data-testid="order-status-SHIPPED"]');
    expect(badgeElement).toBeTruthy();
  });
});
