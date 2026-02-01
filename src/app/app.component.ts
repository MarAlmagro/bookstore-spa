import { Component, inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from './core/services/theme.service';
import { environment } from '../environments/environment';
import { HeaderComponent } from './shared/components/header/header.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [HeaderComponent, RouterModule]
})
export class AppComponent implements OnInit {
  private readonly translate = inject(TranslateService);
  private readonly themeService = inject(ThemeService);
  title = 'bookstore-spa';

  constructor() {
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
