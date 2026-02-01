import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { BookDetailComponent } from './book-detail.component';
import { CatalogService } from '../../services/catalog.service';
import { CartService } from '@core/services';
import { Book } from '@app/models';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

describe('BookDetailComponent', () => {
  let component: BookDetailComponent;
  let fixture: ComponentFixture<BookDetailComponent>;
  let catalogServiceMock: jest.Mocked<Partial<CatalogService>>;
  let cartServiceMock: jest.Mocked<Partial<CartService>>;
  let snackBarMock: jest.Mocked<Partial<MatSnackBar>>;

  const mockBook: Book = {
    id: 1,
    isbn: '123-456-789',
    title: 'Test Book',
    author: 'Test Author',
    description: 'Test description',
    price: 29.99,
    stock: 10,
    category: 'Fiction'
  };

  beforeEach(async () => {
    catalogServiceMock = {
      getBookById: jest.fn().mockReturnValue(of(mockBook))
    };

    cartServiceMock = {
      addItem: jest.fn()
    };

    snackBarMock = {
      open: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [BookDetailComponent],
      imports: [
        TranslateModule.forRoot(),
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule
      ],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: CatalogService, useValue: catalogServiceMock },
        { provide: CartService, useValue: cartServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '1' })
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(BookDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load book by ID from route params', () => {
    fixture.detectChanges();

    expect(catalogServiceMock.getBookById).toHaveBeenCalledWith(1);
  });

  it('should start with quantity of 1', () => {
    expect(component.quantity).toBe(1);
  });

  it('should increase quantity', () => {
    component.quantity = 1;
    component.increaseQuantity(mockBook);
    expect(component.quantity).toBe(2);
  });

  it('should not increase quantity beyond stock', () => {
    component.quantity = 10;
    component.increaseQuantity(mockBook);
    expect(component.quantity).toBe(10);
  });

  it('should decrease quantity', () => {
    component.quantity = 3;
    component.decreaseQuantity();
    expect(component.quantity).toBe(2);
  });

  it('should not decrease quantity below 1', () => {
    component.quantity = 1;
    component.decreaseQuantity();
    expect(component.quantity).toBe(1);
  });

  it('should add book to cart with quantity', () => {
    fixture.detectChanges();
    component.quantity = 3;

    component.addToCart(mockBook);

    expect(cartServiceMock.addItem).toHaveBeenCalledWith(mockBook, 3);
  });

  it('should show snackbar when adding to cart', () => {
    fixture.detectChanges();

    component.addToCart(mockBook);

    expect(snackBarMock.open).toHaveBeenCalled();
  });

  it('should handle error when book not found', () => {
    catalogServiceMock.getBookById = jest.fn().mockReturnValue(
      throwError(() => new Error('Not found'))
    );

    fixture.detectChanges();

    let error: string | null = null;
    component.error$.subscribe(e => error = e);

    expect(error).toBeTruthy();
  });

  it('should set loading state during book fetch', () => {
    const loadingStates: boolean[] = [];
    component.loading$.subscribe(l => loadingStates.push(l));

    fixture.detectChanges();

    // Loading should have been set at some point
    expect(loadingStates.length).toBeGreaterThan(0);
  });
});
