import { Injectable, inject } from '@angular/core';
import { LoggingService } from './logging.service';

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
}

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

@Injectable({ providedIn: 'root' })
export class PerformanceService {
  private readonly logger = inject(LoggingService);
  private readonly marks = new Map<string, number>();

  startMark(name: string): void {
    this.marks.set(name, performance.now());
  }

  endMark(name: string): number {
    const start = this.marks.get(name);
    if (!start) {
      this.logger.warn(`No start mark found for: ${name}`, 'PerformanceService');
      return 0;
    }

    const duration = performance.now() - start;
    this.marks.delete(name);

    this.logger.debug(`Performance: ${name}`, 'PerformanceService', {
      duration: `${duration.toFixed(2)}ms`
    });

    return duration;
  }

  measureCoreWebVitals(): void {
    if ('PerformanceObserver' in globalThis) {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries.at(-1);
        if (lastEntry) {
          this.logger.info('LCP', 'WebVitals', { value: lastEntry.startTime });
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEventTiming;
          this.logger.info('FID', 'WebVitals', { value: fidEntry.processingStart - fidEntry.startTime });
        });
      }).observe({ type: 'first-input', buffered: true });

      new PerformanceObserver((list) => {
        let cls = 0;
        list.getEntries().forEach((entry) => {
          const layoutEntry = entry as LayoutShift;
          if (!layoutEntry.hadRecentInput) {
            cls += layoutEntry.value;
          }
        });
        this.logger.info('CLS', 'WebVitals', { value: cls });
      }).observe({ type: 'layout-shift', buffered: true });
    }
  }
}
