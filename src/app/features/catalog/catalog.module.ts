import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { CatalogRoutingModule } from './catalog-routing.module';
import { BookListComponent } from './pages/book-list/book-list.component';
import { BookDetailComponent } from './pages/book-detail/book-detail.component';
import { SearchResultsComponent } from './pages/search-results/search-results.component';
import { BookCardComponent } from './components/book-card/book-card.component';
import { BookFiltersComponent } from './components/book-filters/book-filters.component';

@NgModule({
  imports: [
    CatalogRoutingModule,
    MatSnackBarModule,
    // Standalone components
    BookListComponent,
    BookDetailComponent,
    SearchResultsComponent,
    BookCardComponent,
    BookFiltersComponent
  ]
})
export class CatalogModule { }
