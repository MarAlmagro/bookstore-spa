import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthResponse, AuthRequest, RegisterRequest } from '@app/models';
import { environment } from '@environments/environment';
import { API_ENDPOINTS } from '../constants';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should return auth response and update state', (done) => {
      const mockResponse: AuthResponse = {
        token: 'access-token',
        refreshToken: 'refresh-token',
        user: { id: 1, email: 'test@test.com', firstName: 'Test', lastName: 'User', role: 'CUSTOMER' }
      };
      const credentials: AuthRequest = { email: 'test@test.com', password: 'password' };

      service.login(credentials).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(service.getAccessToken()).toBe('access-token');
        expect(localStorage.getItem('refresh_token')).toBe('refresh-token');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockResponse);
    });

    it('should update isAuthenticated$ to true', async () => {
      const mockResponse: AuthResponse = {
        token: 'access-token',
        refreshToken: 'refresh-token',
        user: { id: 1, email: 'test@test.com', firstName: 'Test', lastName: 'User', role: 'CUSTOMER' }
      };
      const credentials: AuthRequest = { email: 'test@test.com', password: 'password' };

      const loginPromise = firstValueFrom(service.login(credentials));

      const req = httpMock.expectOne(`${environment.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`);
      req.flush(mockResponse);

      await loginPromise;
      const isAuth = await firstValueFrom(service.isAuthenticated$);
      expect(isAuth).toBe(true);
    });

    it('should handle login error', (done) => {
      const credentials: AuthRequest = { email: 'test@test.com', password: 'wrong' };

      service.login(credentials).subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`);
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('register', () => {
    it('should return auth response and update state', (done) => {
      const mockResponse: AuthResponse = {
        token: 'access-token',
        refreshToken: 'refresh-token',
        user: { id: 1, email: 'new@test.com', firstName: 'New', lastName: 'User', role: 'CUSTOMER' }
      };
      const request: RegisterRequest = {
        email: 'new@test.com',
        password: 'password',
        firstName: 'New',
        lastName: 'User'
      };

      service.register(request).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(service.getAccessToken()).toBe('access-token');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${API_ENDPOINTS.AUTH.REGISTER}`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('logout', () => {
    it('should clear token and user state', async () => {
      localStorage.setItem('refresh_token', 'some-token');
      service['accessToken'] = 'access-token';
      service['_user$'].next({ id: 1, email: 'test@test.com', firstName: 'Test', lastName: 'User', role: 'CUSTOMER' });
      service['_isAuthenticated$'].next(true);

      service.logout();

      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(service.getAccessToken()).toBeNull();
      const isAuth = await firstValueFrom(service.isAuthenticated$);
      expect(isAuth).toBe(false);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token when refresh token exists', (done) => {
      localStorage.setItem('refresh_token', 'refresh-token');
      const mockResponse: AuthResponse = {
        token: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: { id: 1, email: 'test@test.com', firstName: 'Test', lastName: 'User', role: 'CUSTOMER' }
      };

      service.refreshToken().subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(service.getAccessToken()).toBe('new-access-token');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${API_ENDPOINTS.AUTH.REFRESH}`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should return empty response when no refresh token', (done) => {
      service.refreshToken().subscribe(response => {
        expect(response).toEqual({} as AuthResponse);
        done();
      });
    });
  });
});
