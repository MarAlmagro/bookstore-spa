import { TestBed } from '@angular/core/testing';
import { PerformanceService } from './performance.service';
import { LoggingService } from './logging.service';

describe('PerformanceService', () => {
  let service: PerformanceService;
  let loggingServiceMock: jest.Mocked<LoggingService>;

  beforeEach(() => {
    loggingServiceMock = {
      debug: jest.fn(),
      warn: jest.fn(),
      info: jest.fn()
    } as jest.Mocked<LoggingService>;

    TestBed.configureTestingModule({
      providers: [
        PerformanceService,
        { provide: LoggingService, useValue: loggingServiceMock }
      ]
    });

    service = TestBed.inject(PerformanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('startMark', () => {
    it('should store performance mark', () => {
      const performanceNowSpy = jest.spyOn(performance, 'now').mockReturnValue(100);

      service.startMark('test-mark');

      expect(performanceNowSpy).toHaveBeenCalled();
      performanceNowSpy.mockRestore();
    });
  });

  describe('endMark', () => {
    it('should calculate duration and log it', () => {
      const performanceNowSpy = jest.spyOn(performance, 'now')
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(250);

      service.startMark('test-mark');
      const duration = service.endMark('test-mark');

      expect(duration).toBe(150);
      expect(loggingServiceMock.debug).toHaveBeenCalledWith(
        'Performance: test-mark',
        'PerformanceService',
        { duration: '150.00ms' }
      );

      performanceNowSpy.mockRestore();
    });

    it('should warn if no start mark found', () => {
      const duration = service.endMark('non-existent-mark');

      expect(duration).toBe(0);
      expect(loggingServiceMock.warn).toHaveBeenCalledWith(
        'No start mark found for: non-existent-mark',
        'PerformanceService'
      );
    });

    it('should remove mark after ending', () => {
      const performanceNowSpy = jest.spyOn(performance, 'now')
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(200);

      service.startMark('test-mark');
      service.endMark('test-mark');
      
      const duration = service.endMark('test-mark');
      expect(duration).toBe(0);
      expect(loggingServiceMock.warn).toHaveBeenCalled();

      performanceNowSpy.mockRestore();
    });
  });

  describe('measureCoreWebVitals', () => {
    it('should setup PerformanceObserver for web vitals when available', () => {
      const mockObserve = jest.fn();
      const PerformanceObserverMock = jest.fn().mockImplementation(() => ({
        observe: mockObserve
      }));

      (globalThis as unknown as { PerformanceObserver: unknown }).PerformanceObserver = PerformanceObserverMock;

      service.measureCoreWebVitals();

      expect(PerformanceObserverMock).toHaveBeenCalledTimes(3);
      expect(mockObserve).toHaveBeenCalledWith({ type: 'largest-contentful-paint', buffered: true });
      expect(mockObserve).toHaveBeenCalledWith({ type: 'first-input', buffered: true });
      expect(mockObserve).toHaveBeenCalledWith({ type: 'layout-shift', buffered: true });
    });

    it('should not throw error when PerformanceObserver is not available', () => {
      const originalPO = (globalThis as unknown as { PerformanceObserver?: unknown }).PerformanceObserver;
      delete (globalThis as unknown as { PerformanceObserver?: unknown }).PerformanceObserver;

      expect(() => service.measureCoreWebVitals()).not.toThrow();

      (globalThis as unknown as { PerformanceObserver?: unknown }).PerformanceObserver = originalPO;
    });

    it('should log LCP metric', () => {
      const mockGetEntries = jest.fn().mockReturnValue([
        { startTime: 100 },
        { startTime: 200 }
      ]);

      const PerformanceObserverMock = jest.fn().mockImplementation((callback: (list: { getEntries: () => unknown[] }) => void) => {
        setTimeout(() => callback({ getEntries: mockGetEntries }), 0);
        return { observe: jest.fn() };
      });

      (globalThis as unknown as { PerformanceObserver: unknown }).PerformanceObserver = PerformanceObserverMock;

      service.measureCoreWebVitals();

      setTimeout(() => {
        expect(loggingServiceMock.info).toHaveBeenCalledWith(
          'LCP',
          'WebVitals',
          { value: 200 }
        );
      }, 10);
    });
  });
});
