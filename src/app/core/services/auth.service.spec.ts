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
        expect(localStorage.getItem('bookstore_refresh_token')).toBe('refresh-token');
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
      localStorage.setItem('bookstore_refresh_token', 'some-token');
      service['accessToken'] = 'access-token';
      service['_user$'].next({ id: 1, email: 'test@test.com', firstName: 'Test', lastName: 'User', role: 'CUSTOMER' });
      service['_isAuthenticated$'].next(true);

      service.logout();

      expect(localStorage.getItem('bookstore_refresh_token')).toBeNull();
      expect(service.getAccessToken()).toBeNull();
      const isAuth = await firstValueFrom(service.isAuthenticated$);
      expect(isAuth).toBe(false);
    });
  });

  describe('register error handling', () => {
    it('should handle register error and clear auth', (done) => {
      const request: RegisterRequest = {
        email: 'new@test.com',
        password: 'password',
        firstName: 'New',
        lastName: 'User'
      };

      service.register(request).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          expect(service.getAccessToken()).toBeNull();
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${API_ENDPOINTS.AUTH.REGISTER}`);
      req.flush({ message: 'Email already exists' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('initializeAuth', () => {
    it('should attempt refresh when refresh token exists in storage', () => {
      localStorage.setItem('bookstore_refresh_token', 'stored-token');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting(), AuthService]
      });
      const newService = TestBed.inject(AuthService);
      const newHttpMock = TestBed.inject(HttpTestingController);

      const req = newHttpMock.expectOne(`${environment.apiUrl}${API_ENDPOINTS.AUTH.REFRESH}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: 'stored-token' });

      req.flush({
        token: 'new-token',
        refreshToken: 'new-refresh',
        user: { id: 1, email: 'test@test.com', firstName: 'Test', lastName: 'User', role: 'CUSTOMER' }
      });

      expect(newService.getAccessToken()).toBe('new-token');
      newHttpMock.verify();
    });

    it('should clear auth when refresh fails during initialization', async () => {
      localStorage.setItem('bookstore_refresh_token', 'stored-token');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting(), AuthService]
      });
      const newService = TestBed.inject(AuthService);
      const newHttpMock = TestBed.inject(HttpTestingController);

      const req = newHttpMock.expectOne(`${environment.apiUrl}${API_ENDPOINTS.AUTH.REFRESH}`);
      req.flush({ message: 'Token expired' }, { status: 401, statusText: 'Unauthorized' });

      expect(newService.getAccessToken()).toBeNull();
      const isAuth = await firstValueFrom(newService.isAuthenticated$);
      expect(isAuth).toBe(false);
      newHttpMock.verify();
    });
  });

  describe('refreshToken', () => {
    it('should refresh token when refresh token exists', (done) => {
      localStorage.setItem('bookstore_refresh_token', 'refresh-token');
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
