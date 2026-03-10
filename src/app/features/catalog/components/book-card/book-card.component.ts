import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { Book } from '@app/models';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCard,
    MatCardContent,
    MatCardActions,
    MatButton,
    MatIcon,
    TranslateModule
  ],
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
