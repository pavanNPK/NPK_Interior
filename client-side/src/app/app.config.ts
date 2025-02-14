import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';

import { routes } from './app.routes';
import { NbThemeModule, NbMenuModule } from '@nebular/theme';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi} from "@angular/common/http";
import {OverlaySpinnerInterceptor} from "./modules/core/interceptors/overlay-spinner.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
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
