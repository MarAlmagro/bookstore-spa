import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Book } from '@app/models';

@Component({
  selector: 'app-book-card',
  templateUrl: './book-card.component.html',
  styleUrls: ['./book-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookCardComponent {
  @Input() book!: Book;
  @Output() addToCart = new EventEmitter<Book>();
  @Output() viewDetails = new EventEmitter<Book>();

  get isOutOfStock(): boolean {
    return this.book.stock <= 0;
  }

  get isLowStock(): boolean {
    return this.book.stock > 0 && this.book.stock <= 5;
  }

  onAddToCart(event: Event): void {
    event.stopPropagation();
    if (!this.isOutOfStock) {
      this.addToCart.emit(this.book);
    }
  }

  onViewDetails(): void {
    this.viewDetails.emit(this.book);
  }
}
