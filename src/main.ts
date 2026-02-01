import { bootstrapApplication,  BrowserModule } from '@angular/platform-browser';
import { enableProdMode, importProvidersFrom } from '@angular/core';

import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { provideHttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

if (environment.production) {
  enableProdMode();
}

try {
  await bootstrapApplication(AppComponent, {
    providers: [
      provideHttpClient(),
      importProvidersFrom(
        BrowserModule,
        TranslateModule.forRoot({
          defaultLanguage: 'en'
        })
      ),
      provideTranslateHttpLoader({
        prefix: './assets/i18n/',
        suffix: '.json'
      })
    ]
  });
} catch (err) {
  console.error(err);
}
