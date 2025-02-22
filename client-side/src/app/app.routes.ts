import { Routes } from '@angular/router';
import {AccessDeniedComponent} from "./modules/core/components/access-denied/access-denied.component";
import {PageNotFoundComponent} from "./modules/core/components/page-not-found/page-not-found.component";
import {LoginComponent} from "./modules/core/components/login/login.component";
import {RegisterComponent} from "./modules/core/components/register/register.component";

export const routes: Routes = [
  { path: '', loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule) },
  { path: 'access-denied', component: AccessDeniedComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', component: PageNotFoundComponent }
];
