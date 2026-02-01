import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceMock: Partial<AuthService>;
  let routerMock: Partial<Router>;

  beforeEach(() => {
    authServiceMock = {
      isAuthenticated$: of(false)
    };

    routerMock = {
      createUrlTree: jest.fn().mockReturnValue({} as any)
    };

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when authenticated', (done) => {
    authServiceMock.isAuthenticated$ = of(true);

    guard.canActivate({} as any, { url: '/orders' } as any).subscribe(result => {
      expect(result).toBe(true);
      expect(routerMock.createUrlTree).not.toHaveBeenCalled();
      done();
    });
  });

  it('should redirect to login when not authenticated', (done) => {
    authServiceMock.isAuthenticated$ = of(false);

    guard.canActivate({} as any, { url: '/orders' } as any).subscribe(result => {
      expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/auth/login'], {
        queryParams: { returnUrl: '/orders' }
      });
      done();
    });
  });

  it('should pass returnUrl in query params', (done) => {
    authServiceMock.isAuthenticated$ = of(false);
    const testUrl = '/orders/123';

    guard.canActivate({} as any, { url: testUrl } as any).subscribe(() => {
      expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/auth/login'], {
        queryParams: { returnUrl: testUrl }
      });
      done();
    });
  });
});
