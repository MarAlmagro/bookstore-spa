import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, finalize, map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Book, PageResponse } from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private readonly _books$ = new BehaviorSubject<Book[]>([]);
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  private readonly _pagination$ = new BehaviorSubject<PageResponse<Book> | null>(null);
  private readonly _categories$ = new BehaviorSubject<string[]>([]);

  readonly books$ = this._books$.asObservable();
  readonly loading$ = this._loading$.asObservable();
  readonly pagination$ = this._pagination$.asObservable();
  readonly categories$ = this._categories$.asObservable();

  private readonly http = inject(HttpClient);

  loadBooks(page = 0, size = 20): Observable<PageResponse<Book>> {
    this._loading$.next(true);
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<Book>>(`${environment.apiUrl}/books/page`, { params }).pipe(
      tap(response => {
        this._books$.next(response.content);
        this._pagination$.next(response);
        // Only extract categories on first load or if no categories exist
        if (this._categories$.value.length === 0) {
          this.extractCategories(response.content);
        }
      }),
      finalize(() => this._loading$.next(false))
    );
  }

  getBookById(id: number): Observable<Book> {
    this._loading$.next(true);
    return this.http.get<Book>(`${environment.apiUrl}/books/${id}`).pipe(
      finalize(() => this._loading$.next(false))
    );
  }

  searchBooks(query: string): Observable<Book[]> {
    this._loading$.next(true);
    const params = new HttpParams().set('query', query);

    return this.http.get<Book[]>(`${environment.apiUrl}/books/search`, { params }).pipe(
      tap(books => {
        this._books$.next(books);
        this._pagination$.next(null);
      }),
      finalize(() => this._loading$.next(false))
    );
  }

  getBooksByCategory(category: string, page = 0, size = 20): Observable<PageResponse<Book>> {
    this._loading$.next(true);
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<Book>>(`${environment.apiUrl}/books/category/${encodeURIComponent(category)}`, { params }).pipe(
      tap(response => {
        this._books$.next(response.content);
        this._pagination$.next(response);
      }),
      finalize(() => this._loading$.next(false))
    );
  }

  getCategories(): Observable<string[]> {
    return this.categories$;
  }

  loadAllCategories(): Observable<string[]> {
    return this.http.get<Book[]>(`${environment.apiUrl}/books`).pipe(
      map(books => this.extractCategories(books)),
      tap(categories => this._categories$.next(categories))
    );
  }

  private extractCategories(books: Book[]): string[] {
    const categories = [...new Set(books.map(book => book.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    if (categories.length > 0) {
      this._categories$.next(categories);
    }
    return categories;
  }

  clearBooks(): void {
    this._books$.next([]);
    this._pagination$.next(null);
  }
}
