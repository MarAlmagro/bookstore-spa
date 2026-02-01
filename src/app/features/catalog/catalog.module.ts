import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CatalogRoutingModule } from './catalog-routing.module';
import { BookListComponent } from './pages/book-list/book-list.component';
import { BookDetailComponent } from './pages/book-detail/book-detail.component';
import { SearchResultsComponent } from './pages/search-results/search-results.component';
import { BookCardComponent } from './components/book-card/book-card.component';
import { BookFiltersComponent } from './components/book-filters/book-filters.component';
import { SharedModule } from '@app/shared/shared.module';

@NgModule({
  declarations: [
    BookListComponent,
    BookDetailComponent,
    SearchResultsComponent,
    BookCardComponent,
    BookFiltersComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CatalogRoutingModule,
    TranslateModule,
    SharedModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatSnackBarModule,
    MatTooltipModule
  ]
})
export class CatalogModule { }
