import { Component, OnInit, ChangeDetectionStrategy, inject, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent } from '@angular/material/paginator';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { CatalogService } from '../../services/catalog.service';
import { CartService } from '@core/services';
import { Book } from '@app/models';

@Component({
  selector: 'app-book-list',
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
