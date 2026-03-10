import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from './core/services/theme.service';
import { PerformanceService } from './core/services/performance.service';
import { environment } from '../environments/environment';
import { HeaderComponent } from './shared/components/header/header.component';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [HeaderComponent, RouterModule]
})
export class AppComponent implements OnInit {
  private readonly translate = inject(TranslateService);
  private readonly themeService = inject(ThemeService);
  private readonly performanceService = inject(PerformanceService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  title = 'bookstore-spa';

  constructor() {
    this.translate.setFallbackLang(environment.defaultLanguage).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  ngOnInit(): void {
    const browserLang = this.translate.getBrowserLang();
    const supportedLangs = ['es', 'en'];
    const langToUse = supportedLangs.includes(browserLang || '') ? browserLang : environment.defaultLanguage;
    this.translate.use(langToUse || environment.defaultLanguage)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    if (environment.production) {
      this.performanceService.measureCoreWebVitals();
    }

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.focus();
      }
    });
  }
}
