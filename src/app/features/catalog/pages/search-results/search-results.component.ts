import { Component, OnInit, ChangeDetectionStrategy, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { CatalogService } from '../../services/catalog.service';
import { CartService } from '@core/services';
import { Book } from '@app/models';
import { BookCardComponent } from '../../components/book-card/book-card.component';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule,
    BookCardComponent
  ],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchResultsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalogService = inject(CatalogService);
  private readonly cartService = inject(CartService);
  private readonly destroyRef = inject(DestroyRef);

  readonly books$ = this.catalogService.books$;
  readonly loading$ = this.catalogService.loading$;

  searchQuery = '';

  ngOnInit(): void {
    this.route.queryParams.pipe(
      map(params => params['query'] || ''),
      distinctUntilChanged(),
      filter(query => query.length > 0),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(query => {
      this.searchQuery = query;
      this.catalogService.searchBooks(query).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe();
    });
  }

  onAddToCart(book: Book): void {
    this.cartService.addItem(book);
  }

  onViewDetails(book: Book): void {
    this.router.navigate(['/books', book.id]);
  }

  onClearSearch(): void {
    this.router.navigate(['/books']);
  }

  trackByBookId(index: number, book: Book): number {
    return book.id;
  }
}
