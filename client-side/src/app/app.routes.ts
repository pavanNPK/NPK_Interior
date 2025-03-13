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
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent},
  { path: 'terms-and-conditions', component: TermsAndConditionsComponent},
  { path: 'return-policy', component: ReturnPolicyComponent},
  { path: '**', component: PageNotFoundComponent }
];
