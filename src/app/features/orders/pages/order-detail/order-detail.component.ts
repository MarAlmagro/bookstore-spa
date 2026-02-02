import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, switchMap, catchError } from 'rxjs/operators';
import { Order } from '@app/models';
import { OrdersService } from '../../services';
import { OrderStatusBadgeComponent } from '../../components/order-status-badge/order-status-badge.component';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    TranslateModule,
    OrderStatusBadgeComponent
  ],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly ordersService = inject(OrdersService);
  private readonly location = inject(Location);

  order$!: Observable<Order | null>;
  loading$ = new BehaviorSubject<boolean>(false);

  ngOnInit(): void {
    this.order$ = this.route.params.pipe(
      map(params => params['id']),
      tap(() => this.loading$.next(true)),
      switchMap(id => this.ordersService.getOrderById(id).pipe(
        catchError(() => of(null))
      )),
      tap(() => this.loading$.next(false))
    );
  }

  goBack(): void {
    this.location.back();
  }

  formatDate(dateString: string | undefined): string {
    return dateString
      ? new Date(dateString).toLocaleDateString()
      : '';
  }
}
