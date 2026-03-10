import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    document.body.classList.remove('dark-theme');

    TestBed.configureTestingModule({
      providers: [ThemeService]
    });
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.clear();
    document.body.classList.remove('dark-theme');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default to light mode when no saved theme', async () => {
    const isDark = await firstValueFrom(service.isDarkMode$);
    expect(isDark).toBe(false);
  });

  it('should load dark theme from localStorage', () => {
    localStorage.setItem('bookstore_theme', 'dark');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [ThemeService] });
    const newService = TestBed.inject(ThemeService);
    expect(newService.getCurrentTheme()).toBe(true);
    expect(document.body.classList.contains('dark-theme')).toBe(true);
  });

  it('should load light theme from localStorage', () => {
    localStorage.setItem('bookstore_theme', 'light');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [ThemeService] });
    const newService = TestBed.inject(ThemeService);
    expect(newService.getCurrentTheme()).toBe(false);
    expect(document.body.classList.contains('dark-theme')).toBe(false);
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', async () => {
      service.toggleTheme();
      const isDark = await firstValueFrom(service.isDarkMode$);
      expect(isDark).toBe(true);
      expect(document.body.classList.contains('dark-theme')).toBe(true);
    });

    it('should toggle from dark to light', async () => {
      service.setTheme(true);
      service.toggleTheme();
      const isDark = await firstValueFrom(service.isDarkMode$);
      expect(isDark).toBe(false);
      expect(document.body.classList.contains('dark-theme')).toBe(false);
    });
  });

  describe('setTheme', () => {
    it('should set dark theme', async () => {
      service.setTheme(true);
      const isDark = await firstValueFrom(service.isDarkMode$);
      expect(isDark).toBe(true);
      expect(document.body.classList.contains('dark-theme')).toBe(true);
      expect(localStorage.getItem('bookstore_theme')).toBe('dark');
    });

    it('should set light theme', async () => {
      service.setTheme(false);
      const isDark = await firstValueFrom(service.isDarkMode$);
      expect(isDark).toBe(false);
      expect(document.body.classList.contains('dark-theme')).toBe(false);
      expect(localStorage.getItem('bookstore_theme')).toBe('light');
    });
  });

  describe('getCurrentTheme', () => {
    it('should return current theme value', () => {
      expect(service.getCurrentTheme()).toBe(false);
      service.setTheme(true);
      expect(service.getCurrentTheme()).toBe(true);
    });
  });

  describe('storage error handling', () => {
    it('should handle localStorage.setItem error gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      service.setTheme(true);
      expect(consoleSpy).toHaveBeenCalledWith('Storage unavailable');

      consoleSpy.mockRestore();
    });

    it('should handle localStorage.getItem error gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError');
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers: [ThemeService] });
      const newService = TestBed.inject(ThemeService);
      expect(newService.getCurrentTheme()).toBe(false);

      consoleSpy.mockRestore();
    });
  });
});
