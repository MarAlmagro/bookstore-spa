import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandler } from '@angular/common/http';
import { of } from 'rxjs';
import { MockInterceptor } from './mock.interceptor';

describe('MockInterceptor', () => {
  let interceptor: MockInterceptor;
  let httpHandlerMock: { handle: jest.Mock };

  beforeEach(() => {
    httpHandlerMock = {
      handle: jest.fn().mockReturnValue(of({}))
    };

    TestBed.configureTestingModule({
      providers: [MockInterceptor]
    });

    interceptor = TestBed.inject(MockInterceptor);
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should pass through when mocks disabled', (done) => {
    const request = new HttpRequest('GET', '/api/v1/books');

    interceptor.intercept(request, httpHandlerMock as HttpHandler).subscribe(() => {
      expect(httpHandlerMock.handle).toHaveBeenCalledWith(request);
      done();
    });
  });
});
