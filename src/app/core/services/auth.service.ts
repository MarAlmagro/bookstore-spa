import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { AuthRequest, RegisterRequest, AuthResponse, User } from '@app/models';
import { API_ENDPOINTS } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly _user$ = new BehaviorSubject<User | null>(null);
  private readonly _isAuthenticated$ = new BehaviorSubject<boolean>(false);
  private accessToken: string | null = null;

  readonly user$ = this._user$.asObservable();
  readonly isAuthenticated$ = this._isAuthenticated$.asObservable();

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (refreshToken) {
      this.refreshToken().subscribe({
        error: () => this.clearAuth()
      });
    }
  }

  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`,
      credentials
    ).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => {
        this.clearAuth();
        throw error;
      })
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}${API_ENDPOINTS.AUTH.REGISTER}`,
      request
    ).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => {
        this.clearAuth();
        throw error;
      })
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      return of({} as AuthResponse);
    }

    return this.http.post<AuthResponse>(
      `${environment.apiUrl}${API_ENDPOINTS.AUTH.REFRESH}`,
      { refreshToken }
    ).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => {
        this.clearAuth();
        throw error;
      })
    );
  }

  logout(): void {
    this.clearAuth();
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private handleAuthResponse(response: AuthResponse): void {
    this.accessToken = response.token;
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    this._user$.next(response.user);
    this._isAuthenticated$.next(true);
  }

  private clearAuth(): void {
    this.accessToken = null;
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this._user$.next(null);
    this._isAuthenticated$.next(false);
  }
}
