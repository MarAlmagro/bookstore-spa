import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AnnouncerService {
  private announcer: HTMLElement | null = null;

  announce(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
    this.announcer ??= document.getElementById('announcer');

    if (this.announcer) {
      this.announcer.setAttribute('aria-live', politeness);
      this.announcer.textContent = '';
      
      setTimeout(() => {
        if (this.announcer) {
          this.announcer.textContent = message;
        }
      }, 100);
    }
  }
}
