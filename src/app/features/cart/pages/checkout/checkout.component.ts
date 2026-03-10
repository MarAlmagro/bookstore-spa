import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatList, MatListItem } from '@angular/material/list';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, combineLatest, take, switchMap } from 'rxjs';
import { CartService } from '@app/core/services/cart.service';
import { AuthService } from '@app/core/services/auth.service';
import { OrdersService } from '../../../orders/services/orders.service';
import { CreateOrderRequest } from '@app/models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatCardActions,
    MatButton,
    MatList,
    MatListItem,
    MatProgressSpinner
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly ordersService = inject(OrdersService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly items$ = this.cartService.items$;
  readonly total$ = this.cartService.total$;
  readonly user$ = this.authService.user$;
  readonly loading$ = new BehaviorSubject<boolean>(false);

  ngOnInit(): void {
    this.cartService.items$.pipe(take(1)).subscribe(items => {
      if (items.length === 0) {
        this.router.navigate(['/cart']);
      }
    });
  }

  onConfirmOrder(): void {
    this.loading$.next(true);

    combineLatest([
      this.authService.user$,
      this.cartService.items$
    ]).pipe(
      take(1),
      switchMap(([user, items]) => {
        if (!user) throw new Error('Not authenticated');

        const order: CreateOrderRequest = {
          userId: user.id,
          items: items.map(item => ({
            bookId: item.book.id,
            quantity: item.quantity
          }))
        };

        return this.ordersService.createOrder(order);
      })
    ).subscribe({
      next: (order) => {
        this.cartService.clear();
        this.snackBar.open(
          this.translate.instant('checkout.success'),
          this.translate.instant('common.close'),
          { duration: 5000 }
        );
        this.router.navigate(['/orders', order.id]);
      },
      error: () => {
        this.loading$.next(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/cart']);
  }
}
