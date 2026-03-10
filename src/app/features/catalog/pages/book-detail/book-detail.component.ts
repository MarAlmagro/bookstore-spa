import { Component, OnInit, ChangeDetectionStrategy, inject, DestroyRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import { CatalogService } from '../../services/catalog.service';
import { CartService } from '@core/services';
import { Book } from '@app/models';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButton,
    MatIconButton,
    MatIcon,
    MatProgressSpinner,
    TranslateModule
  ],
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly catalogService = inject(CatalogService);
  private readonly cartService = inject(CartService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);

  book$!: Observable<Book | null>;
  loading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);
  quantity = 1;

  ngOnInit(): void {
    this.book$ = this.route.params.pipe(
      map(params => +params['id']),
      tap(() => {
        this.loading$.next(true);
        this.error$.next(null);
      }),
      switchMap(id => this.catalogService.getBookById(id).pipe(
        catchError(() => {
          this.error$.next(this.translate.instant('errors.notFound'));
          return of(null);
        })
      )),
      tap(() => this.loading$.next(false)),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  increaseQuantity(book: Book): void {
    if (this.quantity < book.stock) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(book: Book): void {
    this.cartService.addItem(book, this.quantity);
    this.snackBar.open(
      this.translate.instant('catalog.addedToCart', { title: book.title }),
      this.translate.instant('common.close'),
      { duration: 3000 }
    );
  }

  goBack(): void {
    this.location.back();
  }

}
