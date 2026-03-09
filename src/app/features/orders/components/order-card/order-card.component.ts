import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { Order } from '@app/models';
import { OrderStatusBadgeComponent } from '../order-status-badge/order-status-badge.component';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    TranslateModule,
    OrderStatusBadgeComponent
  ],
  templateUrl: './order-card.component.html',
  styleUrls: ['./order-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderCardComponent {
  @Input() order!: Order;
  @Output() viewDetails = new EventEmitter<string>();

  get itemCount(): number {
    return this.order.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  get formattedDate(): string {
    return this.order.createdAt
      ? new Date(this.order.createdAt).toLocaleDateString()
      : '';
  }

  onViewDetails(): void {
    this.viewDetails.emit(this.order.id);
  }
}
