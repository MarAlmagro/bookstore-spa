import { bootstrapApplication,  BrowserModule } from '@angular/platform-browser';
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { TranslateModule } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppRoutingModule } from './app/app-routing.module';
import { AuthInterceptor, ErrorInterceptor, MockInterceptor } from './app/core/interceptors';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(
      BrowserModule,
      AppRoutingModule,
      TranslateModule.forRoot({
        defaultLanguage: 'en'
      })
    ),
    provideTranslateHttpLoader({
      prefix: './assets/i18n/',
      suffix: '.json'
    }),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MockInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    }
  ]
}).catch(err => console.error(err));
