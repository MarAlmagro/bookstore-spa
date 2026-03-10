import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SecureStorageService } from './secure-storage.service';
import { LoggingService } from './logging.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storage = inject(SecureStorageService);
  private readonly logger = inject(LoggingService);
  private readonly THEME_KEY = 'theme';
  private readonly DARK_THEME_CLASS = 'dark-theme';
  
  private readonly isDarkModeSubject: BehaviorSubject<boolean>;
  public isDarkMode$: Observable<boolean>;

  constructor() {
    const savedTheme = this.loadThemeFromStorage();
    this.isDarkModeSubject = new BehaviorSubject<boolean>(savedTheme);
    this.isDarkMode$ = this.isDarkModeSubject.asObservable();
    
    this.applyTheme(savedTheme);
  }

  toggleTheme(): void {
    const newTheme = !this.isDarkModeSubject.value;
    this.setTheme(newTheme);
  }

  setTheme(isDark: boolean): void {
    this.isDarkModeSubject.next(isDark);
    this.applyTheme(isDark);
    this.saveThemeToStorage(isDark);
  }

  getCurrentTheme(): boolean {
    return this.isDarkModeSubject.value;
  }

  private applyTheme(isDark: boolean): void {
    const body = document.body;
    if (isDark) {
      body.classList.add(this.DARK_THEME_CLASS);
    } else {
      body.classList.remove(this.DARK_THEME_CLASS);
    }
  }

  private saveThemeToStorage(isDark: boolean): void {
    try {
      this.storage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');
    } catch (error) {
      this.logger.warn('Failed to save theme preference', 'ThemeService', { error });
    }
  }

  private loadThemeFromStorage(): boolean {
    try {
      const savedTheme = this.storage.getItem(this.THEME_KEY);
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      
      return globalThis.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
    } catch (error) {
      this.logger.warn('Failed to load theme preference', 'ThemeService', { error });
      return false;
    }
  }
}
