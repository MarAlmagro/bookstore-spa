import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CatalogService } from './catalog.service';
import { Book, PageResponse } from '@app/models';
import { environment } from '@environments/environment';

describe('CatalogService', () => {
  let service: CatalogService;
  let httpMock: HttpTestingController;

  const mockBooks: Book[] = [
    { id: 1, isbn: '123-456', title: 'Book 1', author: 'Author 1', price: 29.99, stock: 10, category: 'Fiction' },
    { id: 2, isbn: '789-012', title: 'Book 2', author: 'Author 2', price: 39.99, stock: 5, category: 'Tech' },
    { id: 3, isbn: '345-678', title: 'Book 3', author: 'Author 3', price: 19.99, stock: 0, category: 'Fiction' }
  ];

  const mockPageResponse: PageResponse<Book> = {
    content: mockBooks,
    page: 0,
    size: 20,
    totalElements: 3,
    totalPages: 1,
    first: true,
    last: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CatalogService]
    });
    service = TestBed.inject(CatalogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadBooks', () => {
    it('should load books with pagination', () => {
      let result: PageResponse<Book> | undefined;

      service.loadBooks(0, 20).subscribe(response => {
        result = response;
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/books/page?page=0&size=20`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPageResponse);

      expect(result).toEqual(mockPageResponse);
    });

    it('should update books$ observable', () => {
      let books: Book[] = [];
      service.books$.subscribe(b => books = b);

      service.loadBooks().subscribe();

      const req = httpMock.expectOne(req => req.url.includes('/books/page'));
      req.flush(mockPageResponse);

      expect(books).toEqual(mockBooks);
    });

    it('should update pagination$ observable', () => {
      let pagination: PageResponse<Book> | null = null;
      service.pagination$.subscribe(p => pagination = p);

      service.loadBooks().subscribe();

      const req = httpMock.expectOne(req => req.url.includes('/books/page'));
      req.flush(mockPageResponse);

      expect(pagination).toEqual(mockPageResponse);
    });

    it('should set loading$ to true during request and false after', () => {
      const loadingStates: boolean[] = [];
      service.loading$.subscribe(loading => loadingStates.push(loading));

      service.loadBooks().subscribe();

      const req = httpMock.expectOne(req => req.url.includes('/books/page'));
      expect(loadingStates).toContain(true);

      req.flush(mockPageResponse);
      expect(loadingStates[loadingStates.length - 1]).toBe(false);
    });

    it('should extract categories from books', () => {
      let categories: string[] = [];
      service.categories$.subscribe(c => categories = c);

      service.loadBooks().subscribe();

      const req = httpMock.expectOne(req => req.url.includes('/books/page'));
      req.flush(mockPageResponse);

      expect(categories).toContain('Fiction');
      expect(categories).toContain('Tech');
      expect(categories.length).toBe(2);
    });
  });

  describe('getBookById', () => {
    it('should get a book by ID', () => {
      const mockBook = mockBooks[0];
      let result: Book | undefined;

      service.getBookById(1).subscribe(book => {
        result = book;
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/books/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockBook);

      expect(result).toEqual(mockBook);
    });

    it('should set loading state during request', () => {
      const loadingStates: boolean[] = [];
      service.loading$.subscribe(loading => loadingStates.push(loading));

      service.getBookById(1).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/books/1`);
      expect(loadingStates).toContain(true);

      req.flush(mockBooks[0]);
      expect(loadingStates[loadingStates.length - 1]).toBe(false);
    });
  });

  describe('searchBooks', () => {
    it('should search books by query', () => {
      const searchResults = [mockBooks[0]];
      let result: Book[] = [];

      service.searchBooks('Book 1').subscribe(books => {
        result = books;
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/books/search?query=Book%201`
      );
      expect(req.request.method).toBe('GET');
      req.flush(searchResults);

      expect(result).toEqual(searchResults);
    });

    it('should update books$ with search results', () => {
      const searchResults = [mockBooks[0]];
      let books: Book[] = [];
      service.books$.subscribe(b => books = b);

      service.searchBooks('Book 1').subscribe();

      const req = httpMock.expectOne(req => req.url.includes('/books/search'));
      req.flush(searchResults);

      expect(books).toEqual(searchResults);
    });

    it('should clear pagination$ on search', () => {
      let pagination: PageResponse<Book> | null = { ...mockPageResponse };
      service.pagination$.subscribe(p => pagination = p);

      service.searchBooks('test').subscribe();

      const req = httpMock.expectOne(req => req.url.includes('/books/search'));
      req.flush([]);

      expect(pagination).toBeNull();
    });
  });

  describe('getBooksByCategory', () => {
    it('should get books by category', () => {
      const fictionBooks = mockBooks.filter(b => b.category === 'Fiction');
      const categoryResponse: PageResponse<Book> = {
        ...mockPageResponse,
        content: fictionBooks,
        totalElements: fictionBooks.length
      };
      let result: PageResponse<Book> | undefined;

      service.getBooksByCategory('Fiction').subscribe(response => {
        result = response;
      });

      const req = httpMock.expectOne(req => 
        req.url.includes('/books/category/Fiction')
      );
      expect(req.request.method).toBe('GET');
      req.flush(categoryResponse);

      expect(result?.content).toEqual(fictionBooks);
    });

    it('should encode category name in URL', () => {
      service.getBooksByCategory('Science Fiction').subscribe();

      const req = httpMock.expectOne(req => 
        req.url.includes('/books/category/Science%20Fiction')
      );
      req.flush(mockPageResponse);
    });
  });

  describe('loadAllCategories', () => {
    it('should load all categories from books', () => {
      let categories: string[] = [];
      
      service.loadAllCategories().subscribe(c => {
        categories = c;
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/books`);
      req.flush(mockBooks);

      expect(categories).toContain('Fiction');
      expect(categories).toContain('Tech');
    });
  });

  describe('clearBooks', () => {
    it('should clear books and pagination', () => {
      let books: Book[] = mockBooks;
      let pagination: PageResponse<Book> | null = mockPageResponse;

      service.books$.subscribe(b => books = b);
      service.pagination$.subscribe(p => pagination = p);

      service.clearBooks();

      expect(books).toEqual([]);
      expect(pagination).toBeNull();
    });
  });
});
