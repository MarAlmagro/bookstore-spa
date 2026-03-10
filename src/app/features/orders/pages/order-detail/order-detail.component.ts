import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
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
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatButton,
    MatIcon,
    MatDivider,
    MatProgressSpinner,
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
