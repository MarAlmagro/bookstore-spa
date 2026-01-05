import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from './core/services/theme.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'bookstore-spa';

  constructor(
    private translate: TranslateService,
    private themeService: ThemeService
  ) {
    this.translate.setDefaultLang(environment.defaultLanguage);
    this.translate.use(environment.defaultLanguage);
  }

  ngOnInit(): void {
    const browserLang = this.translate.getBrowserLang();
    const supportedLangs = ['es', 'en'];
    const langToUse = supportedLangs.includes(browserLang || '') ? browserLang : environment.defaultLanguage;
    this.translate.use(langToUse || environment.defaultLanguage);
  }
}
