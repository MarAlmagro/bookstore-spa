import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
  error?: Error;
}

@Injectable({ providedIn: 'root' })
export class LoggingService {
  private readonly minLevel = environment.production ? LogLevel.WARN : LogLevel.DEBUG;

  debug(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  info(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  warn(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  error(message: string, error?: Error, context?: string, data?: unknown): void {
    this.log(LogLevel.ERROR, message, context, data, error);
  }

  private log(
    level: LogLevel,
    message: string,
    context?: string,
    data?: unknown,
    error?: Error
  ): void {
    if (level < this.minLevel) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      data,
      error
    };

    this.writeLog(entry);

    if (environment.production && level >= LogLevel.ERROR) {
      this.sendToRemote(entry);
    }
  }

  private writeLog(entry: LogEntry): void {
    const prefix = `[${LogLevel[entry.level]}]`;
    const contextStr = entry.context ? `[${entry.context}]` : '';
    const fullMessage = `${prefix}${contextStr} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(fullMessage, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(fullMessage, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(fullMessage, entry.data || '');
        break;
      case LogLevel.ERROR:
        console.error(fullMessage, entry.error || entry.data || '');
        break;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private sendToRemote(entry: LogEntry): void {
    // Implement remote logging (e.g., Sentry, LogRocket, custom endpoint)
    // Example with fetch:
    // fetch('/api/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(entry)
    // }).catch(() => {});
  }
}
