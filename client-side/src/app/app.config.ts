import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';

import { routes } from './app.routes';
import { NbThemeModule, NbMenuModule } from '@nebular/theme';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi} from "@angular/common/http";
import {OverlaySpinnerInterceptor} from "./modules/core/interceptors/overlay-spinner.interceptor";
import {AuthService} from "./services/auth.service";
import {AuthInterceptor} from "./modules/core/interceptors/auth.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    AuthService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    {provide: HTTP_INTERCEPTORS, useClass: OverlaySpinnerInterceptor, multi: true},
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    provideRouter(routes),
    provideClientHydration(),
    importProvidersFrom(
      BrowserAnimationsModule,
      NbThemeModule.forRoot(),
      NbMenuModule.forRoot(),
    )
  ]
};
