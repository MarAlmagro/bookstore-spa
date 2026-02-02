import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CartItem } from '@app/models';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './cart-item.component.html',
  styleUrls: ['./cart-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartItemComponent {
  @Input() item!: CartItem;
  @Output() quantityChange = new EventEmitter<{ bookId: number; quantity: number }>();
  @Output() remove = new EventEmitter<number>();

  get subtotal(): number {
    return this.item.book.price * this.item.quantity;
  }

  onIncrease(): void {
    this.quantityChange.emit({
      bookId: this.item.book.id,
      quantity: this.item.quantity + 1
    });
  }

  onDecrease(): void {
    if (this.item.quantity > 1) {
      this.quantityChange.emit({
        bookId: this.item.book.id,
        quantity: this.item.quantity - 1
      });
    }
  }

  onRemove(): void {
    this.remove.emit(this.item.book.id);
  }
}
