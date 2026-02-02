import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { OrdersRoutingModule } from './orders-routing.module';
import { OrderListComponent } from './pages/order-list/order-list.component';
import { OrderDetailComponent } from './pages/order-detail/order-detail.component';
import { OrderCardComponent } from './components/order-card/order-card.component';
import { OrderStatusBadgeComponent } from './components/order-status-badge/order-status-badge.component';
import { EmptyStateComponent } from '@app/shared/components/empty-state/empty-state.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    OrdersRoutingModule,
    TranslateModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    EmptyStateComponent,
    OrderListComponent,
    OrderDetailComponent,
    OrderCardComponent,
    OrderStatusBadgeComponent
  ]
})
export class OrdersModule { }
