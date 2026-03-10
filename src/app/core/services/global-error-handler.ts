import { ErrorHandler, Injectable, inject } from '@angular/core';
import { LoggingService } from './logging.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly logger = inject(LoggingService);

  handleError(error: Error): void {
    this.logger.error(
      'Unhandled error',
      error,
      'GlobalErrorHandler',
      {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    );

    if (!(globalThis as unknown as { production?: boolean }).production) {
      console.error('Unhandled error:', error);
    }
  }
}
