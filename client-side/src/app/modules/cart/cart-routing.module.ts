import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ViewCartComponent} from "./view-cart/view-cart.component";

const routes: Routes = [
  {path: 'view', component: ViewCartComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CartRoutingModule { }
