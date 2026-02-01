import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
// provideNoopAnimations is the correct modern Angular 21+ API replacing NoopAnimationsModule
// The deprecation warning is a false positive from outdated type definitions
 
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { BookCardComponent } from './book-card.component';
import { Book } from '@app/models';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

describe('BookCardComponent', () => {
  let component: BookCardComponent;
  let fixture: ComponentFixture<BookCardComponent>;

  const mockBook: Book = {
    id: 1,
    isbn: '123-456-789',
    title: 'Test Book Title',
    author: 'Test Author',
    description: 'Test description',
    price: 29.99,
    stock: 10,
    category: 'Fiction'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BookCardComponent],
      imports: [
        TranslateModule.forRoot(),
        MatCardModule,
        MatButtonModule,
        MatIconModule
      ],
      providers: [provideNoopAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(BookCardComponent);
    component = fixture.componentInstance;
    component.book = mockBook;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display book title', () => {
    const titleEl = fixture.debugElement.query(
      By.css('[data-testid="catalog-book-card-1-title"]')
    );
    expect(titleEl.nativeElement.textContent.trim()).toBe('Test Book Title');
  });

  it('should display book author', () => {
    const authorEl = fixture.debugElement.query(
      By.css('[data-testid="catalog-book-card-1-author"]')
    );
    expect(authorEl.nativeElement.textContent.trim()).toBe('Test Author');
  });

  it('should display book price', () => {
    const priceEl = fixture.debugElement.query(
      By.css('[data-testid="catalog-book-card-1-price"]')
    );
    expect(priceEl.nativeElement.textContent).toContain('29.99');
  });

  it('should display category badge', () => {
    const categoryEl = fixture.debugElement.query(
      By.css('[data-testid="catalog-book-card-1-category"]')
    );
    expect(categoryEl.nativeElement.textContent.trim()).toBe('Fiction');
  });

  it('should emit addToCart event when add button clicked', () => {
    jest.spyOn(component.addToCart, 'emit');

    const addBtn = fixture.debugElement.query(
      By.css('[data-testid="catalog-book-card-1-add-cart"]')
    );
    addBtn.triggerEventHandler('click', new MouseEvent('click'));

    expect(component.addToCart.emit).toHaveBeenCalledWith(mockBook);
  });

  it('should emit viewDetails event when view button clicked', () => {
    jest.spyOn(component.viewDetails, 'emit');

    const viewBtn = fixture.debugElement.query(
      By.css('[data-testid="catalog-book-card-1-view"]')
    );
    viewBtn.triggerEventHandler('click', new MouseEvent('click'));

    expect(component.viewDetails.emit).toHaveBeenCalledWith(mockBook);
  });

  it('should emit viewDetails event when card clicked', () => {
    jest.spyOn(component.viewDetails, 'emit');

    const card = fixture.debugElement.query(
      By.css('[data-testid="catalog-book-card-1"]')
    );
    card.triggerEventHandler('click', new MouseEvent('click'));

    expect(component.viewDetails.emit).toHaveBeenCalledWith(mockBook);
  });

  describe('stock status', () => {
    it('should show in stock for books with stock > 5', () => {
      component.book = { ...mockBook, stock: 10 };
      fixture.detectChanges();

      expect(component.isOutOfStock).toBe(false);
      expect(component.isLowStock).toBe(false);
    });

    it('should show low stock for books with stock <= 5', () => {
      component.book = { ...mockBook, stock: 3 };
      fixture.detectChanges();

      expect(component.isOutOfStock).toBe(false);
      expect(component.isLowStock).toBe(true);
    });

    it('should show out of stock for books with stock = 0', () => {
      component.book = { ...mockBook, stock: 0 };
      fixture.detectChanges();

      expect(component.isOutOfStock).toBe(true);
      expect(component.isLowStock).toBe(false);
    });

    it('should disable add to cart button when out of stock', () => {
      component.book = { ...mockBook, stock: 0 };
      fixture.detectChanges();

      const addBtn = fixture.debugElement.query(
        By.css('[data-testid="catalog-book-card-1-add-cart"]')
      );
      expect(addBtn.nativeElement.disabled).toBe(true);
    });

    it('should not emit addToCart when out of stock', () => {
      component.book = { ...mockBook, stock: 0 };
      fixture.detectChanges();
      jest.spyOn(component.addToCart, 'emit');

      component.onAddToCart(new MouseEvent('click'));

      expect(component.addToCart.emit).not.toHaveBeenCalled();
    });
  });

  it('should have correct data-testid on card', () => {
    const card = fixture.debugElement.query(
      By.css('[data-testid="catalog-book-card-1"]')
    );
    expect(card).toBeTruthy();
  });

  it('should have aria-label for accessibility', () => {
    const card = fixture.debugElement.query(
      By.css('[data-testid="catalog-book-card-1"]')
    );
    expect(card.nativeElement.getAttribute('aria-label')).toContain('Test Book Title');
    expect(card.nativeElement.getAttribute('aria-label')).toContain('Test Author');
  });
});
