import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { CartRoutingModule } from './cart-routing.module';
import { CartViewComponent } from './pages/cart-view/cart-view.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { CartItemComponent } from './components/cart-item/cart-item.component';
import { CartSummaryComponent } from './components/cart-summary/cart-summary.component';
import { EmptyStateComponent } from '@app/shared/components/empty-state/empty-state.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CartRoutingModule,
    TranslateModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule,
    EmptyStateComponent,
    CartViewComponent,
    CheckoutComponent,
    CartItemComponent,
    CartSummaryComponent
  ]
})
export class CartModule { }
