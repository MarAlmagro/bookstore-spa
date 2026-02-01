import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { BookListComponent } from './book-list.component';
import { CatalogService } from '../../services/catalog.service';
import { CartService } from '@core/services';
import { Book, PageResponse } from '@app/models';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

describe('BookListComponent', () => {
  let component: BookListComponent;
  let fixture: ComponentFixture<BookListComponent>;
  let catalogServiceMock: jest.Mocked<Partial<CatalogService>>;
  let cartServiceMock: jest.Mocked<Partial<CartService>>;

  const mockBooks: Book[] = [
    { id: 1, isbn: '123', title: 'Book 1', author: 'Author 1', price: 29.99, stock: 10, category: 'Fiction' },
    { id: 2, isbn: '456', title: 'Book 2', author: 'Author 2', price: 39.99, stock: 5, category: 'Tech' }
  ];

  const mockPagination: PageResponse<Book> = {
    content: mockBooks,
    page: 0,
    size: 20,
    totalElements: 2,
    totalPages: 1,
    first: true,
    last: true
  };

  beforeEach(async () => {
    catalogServiceMock = {
      books$: of(mockBooks),
      loading$: of(false),
      pagination$: of(mockPagination),
      categories$: of(['Fiction', 'Tech']),
      loadBooks: jest.fn().mockReturnValue(of(mockPagination)),
      getBooksByCategory: jest.fn().mockReturnValue(of(mockPagination)),
      loadAllCategories: jest.fn().mockReturnValue(of(['Fiction', 'Tech']))
    };

    cartServiceMock = {
      addItem: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [BookListComponent],
      imports: [
        RouterTestingModule,
        NoopAnimationsModule,
        TranslateModule.forRoot(),
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatIconModule,
        MatButtonModule
      ],
      providers: [
        { provide: CatalogService, useValue: catalogServiceMock },
        { provide: CartService, useValue: cartServiceMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(BookListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load books on init', () => {
    fixture.detectChanges();
    expect(catalogServiceMock.loadBooks).toHaveBeenCalled();
  });

  it('should load all categories on init', () => {
    fixture.detectChanges();
    expect(catalogServiceMock.loadAllCategories).toHaveBeenCalled();
  });

  it('should add book to cart', () => {
    fixture.detectChanges();
    const book = mockBooks[0];

    component.onAddToCart(book);

    expect(cartServiceMock.addItem).toHaveBeenCalledWith(book);
  });

  it('should track books by id', () => {
    const book = mockBooks[0];
    expect(component.trackByBookId(0, book)).toBe(1);
  });

  it('should handle page change', () => {
    fixture.detectChanges();
    
    component.onPageChange({ pageIndex: 1, pageSize: 20, length: 100 });

    expect(catalogServiceMock.loadBooks).toHaveBeenCalledWith(1);
  });

  it('should load books by category when category is set', () => {
    component.category = 'Fiction';
    fixture.detectChanges();

    component.loadBooks(0);

    expect(catalogServiceMock.getBooksByCategory).toHaveBeenCalledWith('Fiction', 0);
  });

  it('should load all books when no category', () => {
    component.category = null;
    fixture.detectChanges();

    component.loadBooks(0);

    expect(catalogServiceMock.loadBooks).toHaveBeenCalledWith(0);
  });
});
