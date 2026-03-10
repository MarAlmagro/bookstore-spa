import { Component, OnInit, ChangeDetectionStrategy, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { CatalogService } from '../../services/catalog.service';
import { CartService } from '@core/services';
import { AnnouncerService } from '@core/services/announcer.service';
import { Book } from '@app/models';
import { BookCardComponent } from '../../components/book-card/book-card.component';
import { BookFiltersComponent } from '../../components/book-filters/book-filters.component';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginator,
    MatProgressSpinner,
    MatButton,
    MatIcon,
    TranslateModule,
    BookCardComponent,
    BookFiltersComponent
  ],
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookListComponent implements OnInit {
  private readonly catalogService = inject(CatalogService);
  private readonly cartService = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly announcer = inject(AnnouncerService);

  readonly books$ = this.catalogService.books$;
  readonly loading$ = this.catalogService.loading$;
  readonly pagination$ = this.catalogService.pagination$;
  readonly categories$ = this.catalogService.categories$;

  category: string | null = null;

  ngOnInit(): void {
    this.route.params.pipe(
      map(params => params['category'] || null),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(category => {
      this.category = category;
      this.loadBooks();
    });

    this.catalogService.loadAllCategories().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();

    this.loading$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(loading => {
      if (loading) {
        this.announcer.announce('Loading books, please wait');
      } else {
        this.books$.pipe(
          takeUntilDestroyed(this.destroyRef)
        ).subscribe(books => {
          if (books.length > 0) {
            this.announcer.announce(`${books.length} books loaded`);
          } else {
            this.announcer.announce('No books found');
          }
        });
      }
    });
  }

  loadBooks(page = 0): void {
    if (this.category) {
      this.catalogService.getBooksByCategory(this.category, page).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe();
    } else {
      this.catalogService.loadBooks(page).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe();
    }
  }

  onAddToCart(book: Book): void {
    this.cartService.addItem(book);
  }

  onViewDetails(book: Book): void {
    this.router.navigate(['/books', book.id]);
  }

  onPageChange(event: PageEvent): void {
    this.loadBooks(event.pageIndex);
  }

  onCategoryChange(category: string | null): void {
    if (category) {
      this.router.navigate(['/books/category', category]);
    } else {
      this.router.navigate(['/books']);
    }
  }

  onSearch(query: string): void {
    if (query.trim()) {
      this.router.navigate(['/books/search'], { queryParams: { query } });
    }
  }

  onClearFilters(): void {
    this.router.navigate(['/books']);
  }

  trackByBookId(index: number, book: Book): number {
    return book.id;
  }
}
