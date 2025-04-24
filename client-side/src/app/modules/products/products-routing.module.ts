import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ViewProductsComponent} from "./view-products/view-products.component";
import {AddProductsComponent} from "./add-products/add-products.component";
import {EditProductsComponent} from "./edit-products/edit-products.component";
import {ViewDetailProductsComponent} from "./view-detail-products/view-detail-products.component";

import { roleGuard } from '../../shared/gaurds/role.guard';

const routes: Routes = [
  { path: '', redirectTo: 'view', pathMatch: 'full' },
  { path: 'view', component: ViewProductsComponent, canActivate: [roleGuard] },
  { path: 'add', component: AddProductsComponent, canActivate: [roleGuard] },
  { path: 'edit', component: EditProductsComponent, canActivate: [roleGuard] },
  { path: 'details', component: ViewDetailProductsComponent, canActivate: [roleGuard] }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
