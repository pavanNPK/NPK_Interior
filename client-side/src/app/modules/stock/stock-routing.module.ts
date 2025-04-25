import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {roleGuard} from "../../shared/gaurds/role.guard";
import {AddStockComponent} from "./add-stock/add-stock.component";
import {ViewStockComponent} from "./view-stock/view-stock.component";

const routes: Routes = [
  { path: '', redirectTo: 'view', pathMatch: 'full' },
  {path: 'view', component: ViewStockComponent, title: 'NPK | Stock', canActivate: [roleGuard] },
  {path: 'add', component: AddStockComponent, title: 'NPK | Stock', canActivate: [roleGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StockRoutingModule { }
