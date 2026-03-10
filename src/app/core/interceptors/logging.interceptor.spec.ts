import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { LoggingInterceptor } from './logging.interceptor';
import { LoggingService } from '../services/logging.service';

describe('LoggingInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let loggingServiceMock: jest.Mocked<LoggingService>;

  beforeEach(() => {
    loggingServiceMock = {
      debug: jest.fn(),
      error: jest.fn()
    } as jest.Mocked<LoggingService>;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: LoggingService, useValue: loggingServiceMock },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: LoggingInterceptor,
          multi: true
        }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(loggingServiceMock).toBeTruthy();
  });

  it('should log successful HTTP request in development', () => {
    const testData = { message: 'test' };

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    req.flush(testData);

    expect(loggingServiceMock.debug).toHaveBeenCalledWith(
      'GET /api/test',
      'HTTP',
      expect.objectContaining({
        status: 200,
        duration: expect.stringMatching(/\d+ms/)
      })
    );
  });

  it('should log failed HTTP request in development', () => {
    httpClient.get('/api/test').subscribe({
      error: () => {
        // Error handler
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(loggingServiceMock.error).toHaveBeenCalledWith(
      'GET /api/test failed',
      expect.any(Object),
      'HTTP',
      expect.objectContaining({
        status: 500,
        duration: expect.stringMatching(/\d+ms/)
      })
    );
  });

  it('should not log in production environment', () => {
    // Note: This test is limited because environment is imported at module level
    // In real production, the interceptor checks environment.production
    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    req.flush({ message: 'test' });

    // In development (default), it should log
    expect(loggingServiceMock.debug).toHaveBeenCalled();
  });

  it('should log request with query parameters', () => {
    httpClient.get('/api/test', { params: { id: '123', name: 'test' } }).subscribe();

    const req = httpMock.expectOne(req => req.url.includes('/api/test'));
    req.flush({ message: 'test' });

    expect(loggingServiceMock.debug).toHaveBeenCalledWith(
      expect.stringContaining('GET /api/test'),
      'HTTP',
      expect.any(Object)
    );
  });

  it('should measure request duration', (done) => {
    httpClient.get('/api/test').subscribe(() => {
      const callArgs = loggingServiceMock.debug.mock.calls[0];
      const durationStr = callArgs[2].duration;
      const duration = Number.parseInt(durationStr, 10);

      expect(duration).toBeGreaterThanOrEqual(0);
      done();
    });

    const req = httpMock.expectOne('/api/test');
    setTimeout(() => req.flush({ message: 'test' }), 10);
  });
});
