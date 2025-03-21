import { Routes } from '@angular/router';
import {AccessDeniedComponent} from "./modules/core/components/access-denied/access-denied.component";
import {PageNotFoundComponent} from "./modules/core/components/page-not-found/page-not-found.component";
import {LoginComponent} from "./modules/core/components/login/login.component";
import {RegisterComponent} from "./modules/core/components/register/register.component";
import {authGuard, authLoadGuard} from "./shared/gaurds/auth.guard";
import {ResetPasswordComponent} from "./modules/core/components/reset-password/reset-password.component";
import {PrivacyPolicyComponent} from "./modules/core/components/privacy-policy/privacy-policy.component";
import {
  TermsAndConditionsComponent
} from "./modules/core/components/terms-and-conditions/terms-and-conditions.component";
import {ReturnPolicyComponent} from "./modules/core/components/return-policy/return-policy.component";
export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule),
    canMatch: [authLoadGuard],
    canActivate: [authGuard]
  },
  { path: 'access-denied', component: AccessDeniedComponent },
  { path: 'login', component: LoginComponent, title: 'NPK Interior | Login' },
  { path: 'register', component: RegisterComponent, title: 'NPK Interior | Register' },
  { path: 'reset-password', component: ResetPasswordComponent, title: 'NPK Interior | Reset Password' },
  { path: 'privacy-policy', component: PrivacyPolicyComponent, title: 'NPK Interior | Privacy Policy' },
  { path: 'terms-and-conditions', component: TermsAndConditionsComponent, title: 'NPK Interior | Terms & Conditions' },
  { path: 'return-policy', component: ReturnPolicyComponent, title: 'NPK Interior | Return Policy' },
  { path: '**', component: PageNotFoundComponent, title: 'NPK Interior | Page Not Found' }
];
