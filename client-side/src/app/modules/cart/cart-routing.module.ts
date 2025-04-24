import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ViewCartComponent} from "./view-cart/view-cart.component";
import {roleGuard} from "../../shared/gaurds/role.guard";

const routes: Routes = [
  { path: '', redirectTo: 'view', pathMatch: 'full' },
  {path: 'view', component: ViewCartComponent, title: 'NPK | Cart', canActivate: [roleGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CartRoutingModule { }
