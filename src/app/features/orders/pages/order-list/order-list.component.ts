import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { take, filter, switchMap } from 'rxjs/operators';
import { Order, User } from '@app/models';
import { AuthService } from '@app/core/services';
import { OrdersService } from '../../services';
import { OrderCardComponent } from '../../components/order-card/order-card.component';
import { EmptyStateComponent } from '@app/shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    TranslateModule,
    OrderCardComponent,
    EmptyStateComponent
  ],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderListComponent implements OnInit {
  private readonly ordersService = inject(OrdersService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  orders$ = new BehaviorSubject<Order[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);

  ngOnInit(): void {
    this.loadOrders();
  }

  private loadOrders(): void {
    this.loading$.next(true);

    this.authService.user$.pipe(
      take(1),
      filter((user): user is User => user !== null),
      switchMap(user => this.ordersService.getUserOrders(user.id))
    ).subscribe({
      next: (orders) => {
        this.orders$.next(orders);
        this.loading$.next(false);
      },
      error: () => {
        this.loading$.next(false);
      }
    });
  }

  onViewDetails(orderId: string): void {
    this.router.navigate(['/orders', orderId]);
  }

  browseCatalog(): void {
    this.router.navigate(['/books']);
  }

  trackByOrderId(index: number, order: Order): string {
    return order.id;
  }
}
