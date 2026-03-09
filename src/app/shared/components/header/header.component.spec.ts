import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HeaderComponent } from './header.component';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { User } from '@app/models';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let router: Router;
  let translateService: TranslateService;

  let themeServiceMock: {
    isDarkMode$: BehaviorSubject<boolean>;
    toggleTheme: jest.Mock;
  };
  let authServiceMock: {
    isAuthenticated$: BehaviorSubject<boolean>;
    user$: BehaviorSubject<User | null>;
    logout: jest.Mock;
  };
  let cartServiceMock: {
    itemCount$: BehaviorSubject<number>;
  };

  beforeEach(async () => {
    themeServiceMock = {
      isDarkMode$: new BehaviorSubject<boolean>(false),
      toggleTheme: jest.fn()
    };

    authServiceMock = {
      isAuthenticated$: new BehaviorSubject<boolean>(false),
      user$: new BehaviorSubject<User | null>(null),
      logout: jest.fn()
    };

    cartServiceMock = {
      itemCount$: new BehaviorSubject<number>(0)
    };

    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        { provide: ThemeService, useValue: themeServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: CartService, useValue: cartServiceMock }
      ]
    }).compileComponents();

    translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('es');
    translateService.use('es');

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize observables from services', () => {
    fixture.detectChanges();
    expect(component.isDarkMode$).toBe(themeServiceMock.isDarkMode$);
    expect(component.isAuthenticated$).toBe(authServiceMock.isAuthenticated$);
    expect(component.user$).toBe(authServiceMock.user$);
    expect(component.cartItemCount$).toBe(cartServiceMock.itemCount$);
  });

  it('should set currentLang', () => {
    fixture.detectChanges();
    expect(component.currentLang).toBeTruthy();
  });

  describe('currentLang fallback', () => {
    it('should fall back to es when getCurrentLang and getFallbackLang are both falsy', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [
          HeaderComponent,
          TranslateModule.forRoot()
        ],
        providers: [
          provideNoopAnimations(),
          provideRouter([]),
          { provide: ThemeService, useValue: themeServiceMock },
          { provide: AuthService, useValue: authServiceMock },
          { provide: CartService, useValue: cartServiceMock }
        ]
      });

      const freshTranslate = TestBed.inject(TranslateService);
      jest.spyOn(freshTranslate, 'getCurrentLang').mockReturnValue('');
      jest.spyOn(freshTranslate, 'getFallbackLang').mockReturnValue('');

      const freshFixture = TestBed.createComponent(HeaderComponent);
      const freshComponent = freshFixture.componentInstance;
      expect(freshComponent.currentLang).toBe('es');
    });
  });

  describe('toggleTheme', () => {
    it('should call themeService.toggleTheme', () => {
      fixture.detectChanges();
      component.toggleTheme();
      expect(themeServiceMock.toggleTheme).toHaveBeenCalled();
    });
  });

  describe('changeLanguage', () => {
    it('should call translate.use with the given language and update currentLang', () => {
      fixture.detectChanges();
      const useSpy = jest.spyOn(translateService, 'use');
      component.changeLanguage('en');
      expect(useSpy).toHaveBeenCalledWith('en');
      expect(component.currentLang).toBe('en');
    });
  });

  describe('getCurrentLanguageName', () => {
    it('should return "Español" for es', () => {
      fixture.detectChanges();
      component.currentLang = 'es';
      expect(component.getCurrentLanguageName()).toBe('Español');
    });

    it('should return "English" for en', () => {
      fixture.detectChanges();
      component.currentLang = 'en';
      expect(component.getCurrentLanguageName()).toBe('English');
    });

    it('should return "Español" for unknown language code', () => {
      fixture.detectChanges();
      component.currentLang = 'fr';
      expect(component.getCurrentLanguageName()).toBe('Español');
    });
  });

  describe('logout', () => {
    it('should call authService.logout', () => {
      fixture.detectChanges();
      component.logout();
      expect(authServiceMock.logout).toHaveBeenCalled();
    });
  });

  describe('onSearchSubmit', () => {
    it('should navigate to search results with query', () => {
      fixture.detectChanges();
      component.searchControl.setValue('angular');
      component.onSearchSubmit();
      expect(router.navigate).toHaveBeenCalledWith(['/books/search'], { queryParams: { query: 'angular' } });
    });

    it('should clear search control after submit', () => {
      fixture.detectChanges();
      component.searchControl.setValue('angular');
      component.onSearchSubmit();
      expect(component.searchControl.value).toBe('');
    });

    it('should not navigate when search query is empty', () => {
      fixture.detectChanges();
      component.searchControl.setValue('');
      component.onSearchSubmit();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should not navigate when search query is only whitespace', () => {
      fixture.detectChanges();
      component.searchControl.setValue('   ');
      component.onSearchSubmit();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should trim the query before navigating', () => {
      fixture.detectChanges();
      component.searchControl.setValue('  angular  ');
      component.onSearchSubmit();
      expect(router.navigate).toHaveBeenCalledWith(['/books/search'], { queryParams: { query: 'angular' } });
    });
  });

  describe('clearSearch', () => {
    it('should clear the search control value', () => {
      fixture.detectChanges();
      component.searchControl.setValue('some query');
      component.clearSearch();
      expect(component.searchControl.value).toBe('');
    });
  });

  describe('search value changes', () => {
    it('should navigate on search value change after debounce', (done) => {
      fixture.detectChanges();
      component.searchControl.setValue('test query');
      setTimeout(() => {
        expect(router.navigate).toHaveBeenCalledWith(['/books/search'], { queryParams: { query: 'test query' } });
        done();
      }, 600);
    });

    it('should not navigate on empty search value change', (done) => {
      fixture.detectChanges();
      component.searchControl.setValue('');
      setTimeout(() => {
        expect(router.navigate).not.toHaveBeenCalled();
        done();
      }, 600);
    });
  });
});
