import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ViewStockReqComponent} from "./view-stock-req/view-stock-req.component";
import {roleGuard} from "../../shared/gaurds/role.guard";

const routes: Routes = [
  { path: '', redirectTo: 'view', pathMatch: 'full' },
  {path: 'view', component: ViewStockReqComponent, title: 'NPK | Stock Requests', canActivate: [roleGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StockRequestsRoutingModule { }
