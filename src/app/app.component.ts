import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from './core/services/theme.service';
import { environment } from '../environments/environment';
import { HeaderComponent } from './shared/components/header/header.component';
import { RouterModule } from '@angular/router';

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
  }
}
