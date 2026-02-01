import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { User } from '@app/models';

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
    MatDividerModule,
    TranslateModule,
    AsyncPipe,
    RouterLink
  ]
})
export class HeaderComponent implements OnInit {
  private readonly translate = inject(TranslateService);
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  isDarkMode$: Observable<boolean>;
  isAuthenticated$: Observable<boolean>;
  user$: Observable<User | null>;
  currentLang: string;
  availableLanguages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' }
  ];

  constructor() {
    this.isDarkMode$ = this.themeService.isDarkMode$;
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.user$ = this.authService.user$;
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

  logout(): void {
    this.authService.logout();
  }
}
