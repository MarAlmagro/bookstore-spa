import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookListComponent } from './pages/book-list/book-list.component';
import { BookDetailComponent } from './pages/book-detail/book-detail.component';
import { SearchResultsComponent } from './pages/search-results/search-results.component';

const routes: Routes = [
  { path: '', component: BookListComponent },
  { path: 'search', component: SearchResultsComponent },
  { path: 'category/:category', component: BookListComponent },
  { path: ':id', component: BookDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CatalogRoutingModule { }
