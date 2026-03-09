import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let isAuthenticated$: BehaviorSubject<boolean>;
  let routerMock: { createUrlTree: jest.Mock };

  function setupTestBed(authenticated: boolean): void {
    isAuthenticated$ = new BehaviorSubject<boolean>(authenticated);
    routerMock = {
      createUrlTree: jest.fn().mockReturnValue({})
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: { isAuthenticated$: isAuthenticated$.asObservable() } },
        { provide: Router, useValue: routerMock }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  }

  beforeEach(() => {
    setupTestBed(false);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when authenticated', (done) => {
    setupTestBed(true);

    guard.canActivate({} as ActivatedRouteSnapshot, { url: '/orders' } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(true);
      expect(routerMock.createUrlTree).not.toHaveBeenCalled();
      done();
    });
  });

  it('should redirect to login when not authenticated', (done) => {
    setupTestBed(false);

    guard.canActivate({} as ActivatedRouteSnapshot, { url: '/orders' } as RouterStateSnapshot).subscribe(() => {
      expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/auth/login'], {
        queryParams: { returnUrl: '/orders' }
      });
      done();
    });
  });

  it('should pass returnUrl in query params', (done) => {
    setupTestBed(false);
    const testUrl = '/orders/123';

    guard.canActivate({} as ActivatedRouteSnapshot, { url: testUrl } as RouterStateSnapshot).subscribe(() => {
      expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/auth/login'], {
        queryParams: { returnUrl: testUrl }
      });
      done();
    });
  });
});
