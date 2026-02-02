import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-cart-summary',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './cart-summary.component.html',
  styleUrls: ['./cart-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartSummaryComponent {
  @Input() itemCount = 0;
  @Input() subtotal = 0;
  @Input() canCheckout = true;
  @Output() checkout = new EventEmitter<void>();

  readonly shipping = 0;

  get total(): number {
    return this.subtotal + this.shipping;
  }

  onCheckout(): void {
    this.checkout.emit();
  }
}
