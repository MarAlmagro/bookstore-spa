# Plan 03: Performance Optimization

**Priority**: High 🟠  
**Estimated Effort**: 4-6 hours  
**Dependencies**: None

---

## Objective

Reduce initial bundle size below 750KB warning threshold and implement performance best practices.

---

## Current State

- **Initial bundle**: 969.36KB (exceeds 750KB warning)
- **Component styles exceeding budget**:
  - `book-card.component.scss`: +67B over 2KB
  - `book-detail.component.scss`: +1.55KB over 2KB

---

## Tasks

### 1. Analyze Bundle Size

Run bundle analyzer:

```bash
npm run analyze
```

Identify largest contributors and optimization opportunities.

### 2. Optimize Angular Material Imports

Instead of importing entire Material modules, use specific components:

**Before** (in components):
```typescript
import { MatCardModule } from '@angular/material/card';
```

**After** (tree-shakeable):
```typescript
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
```

### 3. Optimize Component Styles

#### `book-card.component.scss`

Reduce by consolidating styles and removing redundancy:

```scss
// Combine selectors where possible
.book-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover, &:focus {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

// Use CSS variables for repeated values
:host {
  --card-padding: 16px;
  --badge-radius: 4px;
}

.book-cover {
  padding: var(--card-padding);
  // ... rest of styles
}
```

#### `book-detail.component.scss`

Target reduction of 1.55KB:

1. Remove duplicate media queries
2. Consolidate color definitions
3. Use CSS custom properties
4. Remove unused styles

### 4. Implement Route Preloading

Update `app-routing.module.ts`:

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';

const routes: Routes = [
  // ... existing routes
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

### 5. Optimize Category Loading

Current issue: `loadAllCategories()` fetches all books just to extract categories.

**Option A**: Add backend endpoint for categories (preferred)

```typescript
// catalog.service.ts
loadCategories(): Observable<string[]> {
  return this.http.get<string[]>(`${environment.apiUrl}/books/categories`);
}
```

**Option B**: Cache categories from paginated response

```typescript
// catalog.service.ts
loadBooks(page = 0, size = 20): Observable<PageResponse<Book>> {
  this._loading$.next(true);
  const params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString());

  return this.http.get<PageResponse<Book>>(`${environment.apiUrl}/books/page`, { params }).pipe(
    tap(response => {
      this._books$.next(response.content);
      this._pagination$.next(response);
      // Only extract categories on first load
      if (this._categories$.value.length === 0) {
        this.extractCategories(response.content);
      }
    }),
    finalize(() => this._loading$.next(false))
  );
}
```

### 6. Add Image Lazy Loading

For future book cover images:

```html
<img 
  [src]="book.coverUrl" 
  [alt]="book.title"
  loading="lazy"
  decoding="async">
```

### 7. Implement Virtual Scrolling for Large Lists

If book list grows large, use CDK virtual scrolling:

```typescript
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  imports: [ScrollingModule],
  template: `
    <cdk-virtual-scroll-viewport itemSize="300" class="book-list">
      <app-book-card 
        *cdkVirtualFor="let book of books$ | async"
        [book]="book">
      </app-book-card>
    </cdk-virtual-scroll-viewport>
  `
})
```

### 8. Add Service Worker for Caching (PWA)

```bash
ng add @angular/pwa
```

This adds:
- Service worker configuration
- Web app manifest
- Offline caching strategy

### 9. Optimize Third-Party Imports

Review and optimize ngx-translate imports:

```typescript
// Only import what's needed
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
// Don't import TranslateService in components that don't need it
```

### 10. Enable Production Optimizations

Verify `angular.json` production config:

```json
{
  "configurations": {
    "production": {
      "optimization": true,
      "outputHashing": "all",
      "sourceMap": false,
      "namedChunks": false,
      "extractLicenses": true,
      "vendorChunk": false,
      "buildOptimizer": true
    }
  }
}
```

---

## Verification

Run after each optimization:

```bash
# Check bundle size
npm run build:prod

# Analyze bundle
npm run analyze

# Run Lighthouse
npm run lighthouse
```

### Target Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Initial bundle | 969KB | < 750KB |
| book-card.scss | 2.07KB | < 2KB |
| book-detail.scss | 3.55KB | < 2KB |
| Lighthouse Performance | TBD | > 80 |

---

## Files to Modify

| File | Changes |
|------|---------|
| `app-routing.module.ts` | Add PreloadAllModules |
| `book-card.component.scss` | Optimize styles |
| `book-detail.component.scss` | Optimize styles |
| `catalog.service.ts` | Optimize category loading |
| `angular.json` | Verify production config |
| Various components | Optimize Material imports |
