import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { OrderStatus } from '@app/models';

@Component({
  selector: 'app-order-status-badge',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslateModule],
  templateUrl: './order-status-badge.component.html',
  styleUrls: ['./order-status-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderStatusBadgeComponent {
  @Input() status: OrderStatus = 'PENDING';

  readonly statusConfig: Record<OrderStatus, { icon: string; class: string; translationKey: string }> = {
    PENDING: { icon: 'schedule', class: 'status-pending', translationKey: 'orders.status.PENDING' },
    CONFIRMED: { icon: 'check_circle', class: 'status-confirmed', translationKey: 'orders.status.CONFIRMED' },
    SHIPPED: { icon: 'local_shipping', class: 'status-shipped', translationKey: 'orders.status.SHIPPED' },
    DELIVERED: { icon: 'inventory', class: 'status-delivered', translationKey: 'orders.status.DELIVERED' },
    CANCELLED: { icon: 'cancel', class: 'status-cancelled', translationKey: 'orders.status.CANCELLED' }
  };

  get config() {
    return this.statusConfig[this.status];
  }
}
