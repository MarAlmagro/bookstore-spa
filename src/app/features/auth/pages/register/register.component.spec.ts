import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { RegisterComponent } from './register.component';
import { AuthService } from '@core/services';
import { AuthResponse } from '@app/models';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceMock: { register: jest.Mock };
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
      register: jest.fn()
    };

    snackBarMock = {
      open: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} } } }
      ]
    }).compileComponents();

    routerMock = TestBed.inject(Router);
    jest.spyOn(routerMock, 'navigate');

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.registerForm.get('firstName')?.value).toBe('');
    expect(component.registerForm.get('lastName')?.value).toBe('');
    expect(component.registerForm.get('email')?.value).toBe('');
    expect(component.registerForm.get('password')?.value).toBe('');
  });

  it('should have invalid form when empty', () => {
    expect(component.registerForm.valid).toBeFalsy();
  });

  it('should show validation error for empty firstName', () => {
    const control = component.registerForm.get('firstName');
    control?.markAsTouched();
    expect(control?.hasError('required')).toBeTruthy();
  });

  it('should show validation error for firstName exceeding max length', () => {
    const control = component.registerForm.get('firstName');
    control?.setValue('a'.repeat(101));
    expect(control?.hasError('maxlength')).toBeTruthy();
  });

  it('should show validation error for empty lastName', () => {
    const control = component.registerForm.get('lastName');
    control?.markAsTouched();
    expect(control?.hasError('required')).toBeTruthy();
  });

  it('should show validation error for lastName exceeding max length', () => {
    const control = component.registerForm.get('lastName');
    control?.setValue('a'.repeat(101));
    expect(control?.hasError('maxlength')).toBeTruthy();
  });

  it('should show validation error for empty email', () => {
    const control = component.registerForm.get('email');
    control?.markAsTouched();
    expect(control?.hasError('required')).toBeTruthy();
  });

  it('should show validation error for invalid email', () => {
    const control = component.registerForm.get('email');
    control?.setValue('invalid-email');
    expect(control?.hasError('email')).toBeTruthy();
  });

  it('should show validation error for empty password', () => {
    const control = component.registerForm.get('password');
    control?.markAsTouched();
    expect(control?.hasError('required')).toBeTruthy();
  });

  it('should show validation error for short password', () => {
    const control = component.registerForm.get('password');
    control?.setValue('12345');
    expect(control?.hasError('minlength')).toBeTruthy();
  });

  it('should have valid form with correct values', () => {
    component.registerForm.setValue({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123'
    });
    expect(component.registerForm.valid).toBeTruthy();
  });

  it('should not call authService.register when form is invalid', () => {
    component.onSubmit();
    expect(authServiceMock.register).not.toHaveBeenCalled();
  });

  it('should call authService.register on valid submit', () => {
    authServiceMock.register.mockReturnValue(of(mockAuthResponse));

    component.registerForm.setValue({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123'
    });
    component.onSubmit();

    expect(authServiceMock.register).toHaveBeenCalledWith({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('should navigate to home on successful registration', () => {
    authServiceMock.register.mockReturnValue(of(mockAuthResponse));

    component.registerForm.setValue({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123'
    });
    component.onSubmit();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should show success snackbar on successful registration', () => {
    authServiceMock.register.mockReturnValue(of(mockAuthResponse));

    component.registerForm.setValue({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123'
    });
    component.onSubmit();

    expect(snackBarMock.open).toHaveBeenCalled();
  });

  it('should show loading state during submit', () => {
    authServiceMock.register.mockReturnValue(of(mockAuthResponse));

    component.registerForm.setValue({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123'
    });

    let loadingValue = false;
    component.loading$.subscribe(val => loadingValue = val);

    component.onSubmit();
    expect(loadingValue).toBeTruthy();
  });

  it('should stop loading on error', () => {
    authServiceMock.register.mockReturnValue(throwError(() => new Error('Registration failed')));

    component.registerForm.setValue({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123'
    });
    component.onSubmit();

    let loadingValue = true;
    component.loading$.subscribe(val => loadingValue = val);
    expect(loadingValue).toBeFalsy();
  });

  it('should show error snackbar on registration failure', () => {
    authServiceMock.register.mockReturnValue(throwError(() => new Error('Registration failed')));

    component.registerForm.setValue({
      firstName: 'Test',
      lastName: 'User',
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
