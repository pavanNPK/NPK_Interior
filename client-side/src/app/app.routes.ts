import { Routes } from '@angular/router';
import {AccessDeniedComponent} from "./modules/core/components/access-denied/access-denied.component";
import {PageNotFoundComponent} from "./modules/core/components/page-not-found/page-not-found.component";

export const routes: Routes = [
  { path: '', loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule) },
  { path: 'access-denied', component: AccessDeniedComponent },
  { path: '**', component: PageNotFoundComponent }
];
