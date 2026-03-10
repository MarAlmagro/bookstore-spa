import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SecureStorageService {
  private readonly prefix = 'bookstore_';

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(this.prefix + key, value);
    } catch {
      console.warn('Storage unavailable');
    }
  }

  getItem(key: string): string | null {
    try {
      return localStorage.getItem(this.prefix + key);
    } catch {
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch {
      // Ignore errors
    }
  }

  clear(): void {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => localStorage.removeItem(key));
    } catch {
      // Ignore errors
    }
  }
}
