import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ViewDealsComponent} from "./view-deals/view-deals.component";

const routes: Routes = [
  {path: 'view', component: ViewDealsComponent, title: 'NPK | Deals'}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DealsRoutingModule { }
