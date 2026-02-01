import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '../../../core/services/theme.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    TranslateModule,
    AsyncPipe
  ]
})
export class HeaderComponent implements OnInit {
  private readonly translate = inject(TranslateService);
  private readonly themeService = inject(ThemeService);
  private readonly destroyRef = inject(DestroyRef);
  isDarkMode$: Observable<boolean>;
  currentLang: string;
  availableLanguages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' }
  ];

  constructor() {
    this.isDarkMode$ = this.themeService.isDarkMode$;
    this.currentLang = this.translate.getCurrentLang() || this.translate.getFallbackLang() || 'es';
  }

  ngOnInit(): void {
    this.translate.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  changeLanguage(lang: string): void {
    this.translate.use(lang)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
    this.currentLang = lang;
  }

  getCurrentLanguageName(): string {
    const lang = this.availableLanguages.find(l => l.code === this.currentLang);
    return lang ? lang.name : 'Español';
  }
}
