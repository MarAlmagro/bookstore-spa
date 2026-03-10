# Plan 06: Accessibility Improvements

**Priority**: Medium 🟡  
**Estimated Effort**: 3-4 hours  
**Dependencies**: None

---

## Objective

Enhance accessibility to ensure WCAG 2.1 AA compliance with skip links, reduced motion support, and improved screen reader experience.

---

## Tasks

### 1. Add Skip Link

Update `src/index.html`:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>BookstoreSpa</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link rel="preconnect" href="https://fonts.gstatic.com">
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
</head>
<body class="mat-typography">
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <app-root></app-root>
</body>
</html>
```

Add skip link styles to `src/styles.scss`:

```scss
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #3f51b5;
  color: white;
  padding: 8px 16px;
  z-index: 10000;
  text-decoration: none;
  font-weight: 500;
  border-radius: 0 0 4px 0;
  
  &:focus {
    top: 0;
    outline: 2px solid #ff4081;
    outline-offset: 2px;
  }
}
```

Update `app.component.html` to add main content ID:

```html
<app-header></app-header>
<main id="main-content" tabindex="-1">
  <router-outlet></router-outlet>
</main>
```

### 2. Add Reduced Motion Support

Create `src/styles/_accessibility.scss`:

```scss
// Respect user's motion preferences
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

// High contrast mode support
@media (prefers-contrast: high) {
  :root {
    --border-color: currentColor;
  }
  
  .mat-mdc-card {
    border: 2px solid currentColor;
  }
  
  .mat-mdc-button {
    border: 2px solid currentColor;
  }
}
```

Import in `src/styles.scss`:

```scss
@use './styles/theme';
@use './styles/accessibility';
```

### 3. Improve Focus Indicators

Add to `src/styles.scss`:

```scss
// Enhanced focus indicators
:focus-visible {
  outline: 3px solid #ff4081;
  outline-offset: 2px;
}

// Remove default outline when using mouse
:focus:not(:focus-visible) {
  outline: none;
}

// Ensure focus is visible on all interactive elements
a:focus-visible,
button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible,
[tabindex]:focus-visible {
  outline: 3px solid #ff4081;
  outline-offset: 2px;
}
```

### 4. Add ARIA Live Regions for Dynamic Content

Update `app.component.html`:

```html
<app-header></app-header>
<main id="main-content" tabindex="-1">
  <router-outlet></router-outlet>
</main>

<!-- Screen reader announcements -->
<div 
  aria-live="polite" 
  aria-atomic="true" 
  class="sr-only"
  id="announcer">
</div>
```

Create announcement service `src/app/core/services/announcer.service.ts`:

```typescript
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AnnouncerService {
  private announcer: HTMLElement | null = null;

  announce(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
    if (!this.announcer) {
      this.announcer = document.getElementById('announcer');
    }

    if (this.announcer) {
      this.announcer.setAttribute('aria-live', politeness);
      this.announcer.textContent = '';
      
      // Small delay to ensure screen readers pick up the change
      setTimeout(() => {
        if (this.announcer) {
          this.announcer.textContent = message;
        }
      }, 100);
    }
  }
}
```

Add screen reader only styles:

```scss
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### 5. Improve Form Accessibility

Update form components to announce errors:

```typescript
// login.component.ts
import { AnnouncerService } from '@core/services/announcer.service';

export class LoginComponent {
  private readonly announcer = inject(AnnouncerService);

  onSubmit(): void {
    if (this.loginForm.invalid) {
      const errors = this.getFormErrors();
      this.announcer.announce(`Form has errors: ${errors.join(', ')}`, 'assertive');
      return;
    }
    // ... rest of submit logic
  }

  private getFormErrors(): string[] {
    const errors: string[] = [];
    if (this.loginForm.get('email')?.hasError('required')) {
      errors.push('Email is required');
    }
    if (this.loginForm.get('email')?.hasError('email')) {
      errors.push('Email is invalid');
    }
    if (this.loginForm.get('password')?.hasError('required')) {
      errors.push('Password is required');
    }
    return errors;
  }
}
```

### 6. Add Focus Management on Route Changes

Update `app.component.ts`:

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export class AppComponent implements OnInit {
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Focus main content on route change
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.focus();
      }
    });
  }
}
```

### 7. Improve Color Contrast

Review and update colors in `src/styles/_theme.scss`:

```scss
// Ensure text colors meet WCAG AA contrast requirements
// Primary text on light background: 4.5:1 minimum
// Large text (18px+ or 14px+ bold): 3:1 minimum

$bookstore-primary: mat.m2-define-palette(mat.$m2-indigo-palette, 700, 500, 900);
$bookstore-accent: mat.m2-define-palette(mat.$m2-blue-grey-palette, 700, 500, 900);

// Custom text colors with sufficient contrast
:root {
  --text-primary: rgba(0, 0, 0, 0.87);      // 15.5:1 on white
  --text-secondary: rgba(0, 0, 0, 0.6);     // 7.5:1 on white
  --text-disabled: rgba(0, 0, 0, 0.38);     // 4.5:1 on white
}

.dark-theme {
  --text-primary: rgba(255, 255, 255, 0.87);
  --text-secondary: rgba(255, 255, 255, 0.6);
  --text-disabled: rgba(255, 255, 255, 0.38);
}
```

### 8. Add Landmark Roles

Update component templates with proper landmarks:

```html
<!-- header.component.html -->
<mat-toolbar color="primary" class="header-toolbar" role="banner">
  <nav aria-label="Main navigation">
    <!-- navigation content -->
  </nav>
</mat-toolbar>

<!-- book-list.component.html -->
<section aria-label="Book catalog" role="region">
  <div role="list" class="book-grid">
    <app-book-card 
      *ngFor="let book of books$ | async"
      [book]="book"
      role="listitem">
    </app-book-card>
  </div>
</section>
```

### 9. Add Loading State Announcements

Update components to announce loading states:

```typescript
// book-list.component.ts
ngOnInit(): void {
  this.loading$.pipe(
    takeUntilDestroyed(this.destroyRef)
  ).subscribe(loading => {
    if (loading) {
      this.announcer.announce('Loading books, please wait');
    } else {
      this.books$.pipe(take(1)).subscribe(books => {
        this.announcer.announce(`${books.length} books loaded`);
      });
    }
  });
}
```

---

## Verification

Run accessibility audit:

```bash
npm run lighthouse
```

Manual testing checklist:

- [ ] Skip link appears on Tab and navigates to main content
- [ ] All interactive elements have visible focus indicators
- [ ] Animations disabled with `prefers-reduced-motion`
- [ ] Screen reader announces dynamic content changes
- [ ] Form errors announced to screen readers
- [ ] Focus moves to main content on route change
- [ ] Color contrast meets WCAG AA (4.5:1 for normal text)
- [ ] All images have alt text
- [ ] All form fields have labels

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/index.html` | Modify (add skip link) |
| `src/styles.scss` | Modify (add a11y styles) |
| `src/styles/_accessibility.scss` | Create |
| `app.component.html` | Modify (add main ID) |
| `app.component.ts` | Modify (focus management) |
| `announcer.service.ts` | Create |
| `header.component.html` | Modify (add landmarks) |
| `book-list.component.html` | Modify (add landmarks) |
| `login.component.ts` | Modify (error announcements) |
