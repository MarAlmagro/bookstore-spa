import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { CartItem, Book, OrderItem } from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'bookstore_cart';
  private readonly _items$ = new BehaviorSubject<CartItem[]>([]);

  readonly items$ = this._items$.asObservable();
  readonly itemCount$ = this.items$.pipe(
    map(items => items.reduce((count, item) => count + item.quantity, 0))
  );
  readonly total$ = this.items$.pipe(
    map(items => items.reduce((total, item) => total + (item.book.price * item.quantity), 0))
  );

  constructor() {
    this.loadFromStorage();
  }

  addItem(book: Book, quantity = 1): void {
    const currentItems = this._items$.value;
    const existingItem = currentItems.find(item => item.book.id === book.id);

    let updatedItems: CartItem[];
    if (existingItem) {
      updatedItems = currentItems.map(item =>
        item.book.id === book.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      updatedItems = [...currentItems, { book, quantity }];
    }

    this.updateCart(updatedItems);
  }

  updateQuantity(bookId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(bookId);
      return;
    }

    const updatedItems = this._items$.value.map(item =>
      item.book.id === bookId ? { ...item, quantity } : item
    );
    this.updateCart(updatedItems);
  }

  removeItem(bookId: number): void {
    const updatedItems = this._items$.value.filter(item => item.book.id !== bookId);
    this.updateCart(updatedItems);
  }

  clear(): void {
    this.updateCart([]);
  }

  getOrderItems(): Pick<OrderItem, 'bookId' | 'quantity'>[] {
    return this._items$.value.map(item => ({
      bookId: item.book.id,
      quantity: item.quantity
    }));
  }

  private updateCart(items: CartItem[]): void {
    this._items$.next(items);
    this.saveToStorage(items);
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.CART_STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored) as CartItem[];
        this._items$.next(items);
      }
    } catch (error) {
      console.error('Failed to load cart from storage:', error);
      this._items$.next([]);
    }
  }

  private saveToStorage(items: CartItem[]): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart to storage:', error);
    }
  }
}
