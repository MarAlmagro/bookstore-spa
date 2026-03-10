import { TestBed } from '@angular/core/testing';
import { GlobalErrorHandler } from './global-error-handler';
import { LoggingService } from './logging.service';

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;
  let loggingServiceMock: jest.Mocked<LoggingService>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    loggingServiceMock = {
      error: jest.fn()
    } as jest.Mocked<LoggingService>;

    TestBed.configureTestingModule({
      providers: [
        GlobalErrorHandler,
        { provide: LoggingService, useValue: loggingServiceMock }
      ]
    });

    handler = TestBed.inject(GlobalErrorHandler);
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });

  it('should log error with LoggingService', () => {
    const error = new Error('Test error');
    error.stack = 'Error stack trace';

    handler.handleError(error);

    expect(loggingServiceMock.error).toHaveBeenCalledWith(
      'Unhandled error',
      error,
      'GlobalErrorHandler',
      {
        name: 'Error',
        message: 'Test error',
        stack: 'Error stack trace'
      }
    );
  });

  it('should log to console in development', () => {
    const error = new Error('Test error');
    (globalThis as unknown as { production?: boolean }).production = false;

    handler.handleError(error);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Unhandled error:', error);
  });

  it('should not log to console in production', () => {
    const error = new Error('Test error');
    (globalThis as unknown as { production?: boolean }).production = true;

    handler.handleError(error);

    expect(consoleErrorSpy).not.toHaveBeenCalled();

    delete (globalThis as unknown as { production?: boolean }).production;
  });
});
