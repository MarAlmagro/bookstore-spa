import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SearchResultsComponent } from './search-results.component';
import { CatalogService } from '../../services/catalog.service';
import { CartService } from '@core/services';
import { Book } from '@app/models';

describe('SearchResultsComponent', () => {
  let component: SearchResultsComponent;
  let fixture: ComponentFixture<SearchResultsComponent>;
  let router: Router;

  const mockBooks: Book[] = [
    { id: 1, isbn: '123', title: 'Angular Book', author: 'Author 1', price: 29.99, stock: 10, category: 'Tech' },
    { id: 2, isbn: '456', title: 'RxJS Book', author: 'Author 2', price: 39.99, stock: 5, category: 'Tech' }
  ];

  let catalogServiceMock: {
    books$: BehaviorSubject<Book[]>;
    loading$: BehaviorSubject<boolean>;
    searchBooks: jest.Mock;
  };
  let cartServiceMock: {
    addItem: jest.Mock;
  };
  let queryParams$: BehaviorSubject<Record<string, string>>;

  beforeEach(async () => {
    queryParams$ = new BehaviorSubject<Record<string, string>>({ query: 'angular' });

    catalogServiceMock = {
      books$: new BehaviorSubject<Book[]>(mockBooks),
      loading$: new BehaviorSubject<boolean>(false),
      searchBooks: jest.fn().mockReturnValue(of(mockBooks))
    };

    cartServiceMock = {
      addItem: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        SearchResultsComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        { provide: CatalogService, useValue: catalogServiceMock },
        { provide: CartService, useValue: cartServiceMock },
        {
          provide: ActivatedRoute,
          useValue: { queryParams: queryParams$.asObservable() }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchResultsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should search books based on query param on init', () => {
    fixture.detectChanges();
    expect(catalogServiceMock.searchBooks).toHaveBeenCalledWith('angular');
    expect(component.searchQuery).toBe('angular');
  });

  it('should not search when query param is empty', () => {
    queryParams$.next({ query: '' });
    fixture.detectChanges();
    expect(catalogServiceMock.searchBooks).not.toHaveBeenCalled();
  });

  it('should not search when query param is missing', () => {
    queryParams$.next({});
    fixture.detectChanges();
    expect(catalogServiceMock.searchBooks).not.toHaveBeenCalled();
  });

  it('should update search when query param changes', () => {
    fixture.detectChanges();
    jest.clearAllMocks();

    queryParams$.next({ query: 'rxjs' });
    expect(catalogServiceMock.searchBooks).toHaveBeenCalledWith('rxjs');
    expect(component.searchQuery).toBe('rxjs');
  });

  it('should not re-search when same query param emitted', () => {
    fixture.detectChanges();
    jest.clearAllMocks();

    queryParams$.next({ query: 'angular' });
    expect(catalogServiceMock.searchBooks).not.toHaveBeenCalled();
  });

  describe('onAddToCart', () => {
    it('should add book to cart', () => {
      fixture.detectChanges();
      component.onAddToCart(mockBooks[0]);
      expect(cartServiceMock.addItem).toHaveBeenCalledWith(mockBooks[0]);
    });
  });

  describe('onViewDetails', () => {
    it('should navigate to book detail page', () => {
      fixture.detectChanges();
      component.onViewDetails(mockBooks[0]);
      expect(router.navigate).toHaveBeenCalledWith(['/books', 1]);
    });
  });

  describe('onClearSearch', () => {
    it('should navigate to books list', () => {
      fixture.detectChanges();
      component.onClearSearch();
      expect(router.navigate).toHaveBeenCalledWith(['/books']);
    });
  });

  describe('trackByBookId', () => {
    it('should return book id', () => {
      expect(component.trackByBookId(0, mockBooks[0])).toBe(1);
      expect(component.trackByBookId(1, mockBooks[1])).toBe(2);
    });
  });
});
