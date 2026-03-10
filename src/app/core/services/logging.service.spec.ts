import { TestBed } from '@angular/core/testing';
import { LoggingService, LogLevel } from './logging.service';

describe('LoggingService', () => {
  let service: LoggingService;
  let consoleDebugSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoggingService);

    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('debug', () => {
    it('should log debug message with context and data', () => {
      service.debug('Test debug', 'TestContext', { key: 'value' });

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        '[DEBUG][TestContext] Test debug',
        { key: 'value' }
      );
    });

    it('should log debug message without context', () => {
      service.debug('Test debug');

      expect(consoleDebugSpy).toHaveBeenCalledWith('[DEBUG] Test debug', '');
    });
  });

  describe('info', () => {
    it('should log info message with context and data', () => {
      service.info('Test info', 'TestContext', { key: 'value' });

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[INFO][TestContext] Test info',
        { key: 'value' }
      );
    });
  });

  describe('warn', () => {
    it('should log warning message with context and data', () => {
      service.warn('Test warning', 'TestContext', { key: 'value' });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[WARN][TestContext] Test warning',
        { key: 'value' }
      );
    });
  });

  describe('error', () => {
    it('should log error message with error object', () => {
      const error = new Error('Test error');
      service.error('Test error message', error, 'TestContext', { key: 'value' });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ERROR][TestContext] Test error message',
        error
      );
    });

    it('should log error message without error object', () => {
      service.error('Test error message', undefined, 'TestContext', { key: 'value' });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ERROR][TestContext] Test error message',
        { key: 'value' }
      );
    });
  });

  describe('log levels', () => {
    it('should respect minimum log level in development', () => {
      service.debug('Debug message');
      service.info('Info message');
      service.warn('Warn message');
      service.error('Error message');

      expect(consoleDebugSpy).toHaveBeenCalled();
      expect(consoleInfoSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('LogLevel enum', () => {
    it('should have correct log level values', () => {
      expect(LogLevel.DEBUG).toBe(0);
      expect(LogLevel.INFO).toBe(1);
      expect(LogLevel.WARN).toBe(2);
      expect(LogLevel.ERROR).toBe(3);
    });
  });
});
