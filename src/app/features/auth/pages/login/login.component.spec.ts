import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '@core/services';
import { AuthResponse } from '@app/models';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: { login: jest.Mock };
  let routerMock: Router;
  let snackBarMock: { open: jest.Mock };

  const mockAuthResponse: AuthResponse = {
    token: 'test-token',
    refreshToken: 'test-refresh-token',
    user: {
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'CUSTOMER'
    }
  };

  beforeEach(async () => {
    authServiceMock = {
      login: jest.fn()
    };

    snackBarMock = {
      open: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
                { provide: AuthService, useValue: authServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {}
            }
          }
        }
      ]
    }).compileComponents();

    routerMock = TestBed.inject(Router);
    jest.spyOn(routerMock, 'navigateByUrl');

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should have invalid form when empty', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('should show validation error for empty email', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.markAsTouched();
    expect(emailControl?.hasError('required')).toBeTruthy();
  });

  it('should show validation error for invalid email', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTruthy();
  });

  it('should show validation error for empty password', () => {
    const passwordControl = component.loginForm.get('password');
    passwordControl?.markAsTouched();
    expect(passwordControl?.hasError('required')).toBeTruthy();
  });

  it('should show validation error for short password', () => {
    const passwordControl = component.loginForm.get('password');
    passwordControl?.setValue('12345');
    expect(passwordControl?.hasError('minlength')).toBeTruthy();
  });

  it('should have valid form with correct values', () => {
    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123'
    });
    expect(component.loginForm.valid).toBeTruthy();
  });

  it('should not call authService.login when form is invalid', () => {
    component.onSubmit();
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('should call authService.login on valid submit', () => {
    authServiceMock.login.mockReturnValue(of(mockAuthResponse));

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123'
    });
    component.onSubmit();

    expect(authServiceMock.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('should navigate to returnUrl on successful login', () => {
    authServiceMock.login.mockReturnValue(of(mockAuthResponse));

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123'
    });
    component.onSubmit();

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('should show success snackbar on successful login', () => {
    authServiceMock.login.mockReturnValue(of(mockAuthResponse));

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123'
    });
    component.onSubmit();

    expect(snackBarMock.open).toHaveBeenCalled();
  });

  it('should show loading state during submit', () => {
    authServiceMock.login.mockReturnValue(of(mockAuthResponse));

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123'
    });

    let loadingValue = false;
    component.loading$.subscribe(val => loadingValue = val);

    component.onSubmit();
    expect(loadingValue).toBeTruthy();
  });

  it('should stop loading on error', () => {
    authServiceMock.login.mockReturnValue(throwError(() => new Error('Login failed')));

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123'
    });
    component.onSubmit();

    let loadingValue = true;
    component.loading$.subscribe(val => loadingValue = val);
    expect(loadingValue).toBeFalsy();
  });

  it('should show error snackbar on login failure', () => {
    authServiceMock.login.mockReturnValue(throwError(() => new Error('Login failed')));

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123'
    });
    component.onSubmit();

    expect(snackBarMock.open).toHaveBeenCalled();
  });

  it('should toggle password visibility', () => {
    expect(component.hidePassword).toBeTruthy();
    component.hidePassword = !component.hidePassword;
    expect(component.hidePassword).toBeFalsy();
  });
});
