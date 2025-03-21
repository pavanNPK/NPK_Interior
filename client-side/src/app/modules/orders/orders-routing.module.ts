import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ViewOrdersComponent} from "./view-orders/view-orders.component";

const routes: Routes = [
  {path: 'view', component: ViewOrdersComponent, title: 'NPK | Orders'}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule { }
