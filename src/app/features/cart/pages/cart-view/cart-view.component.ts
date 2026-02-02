import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CartService } from '@app/core/services/cart.service';
import { CartItem } from '@app/models';
import { CartItemComponent } from '../../components/cart-item/cart-item.component';
import { CartSummaryComponent } from '../../components/cart-summary/cart-summary.component';
import { EmptyStateComponent } from '@app/shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-cart-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslateModule,
    CartItemComponent,
    CartSummaryComponent,
    EmptyStateComponent
  ],
  templateUrl: './cart-view.component.html',
  styleUrls: ['./cart-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartViewComponent {
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  readonly items$ = this.cartService.items$;
  readonly itemCount$ = this.cartService.itemCount$;
  readonly total$ = this.cartService.total$;

  onQuantityChange(event: { bookId: number; quantity: number }): void {
    this.cartService.updateQuantity(event.bookId, event.quantity);
  }

  onRemove(bookId: number): void {
    this.cartService.removeItem(bookId);
  }

  onCheckout(): void {
    this.router.navigate(['/cart/checkout']);
  }

  browseCatalog(): void {
    this.router.navigate(['/books']);
  }

  trackByBookId(index: number, item: CartItem): number {
    return item.book.id;
  }
}
