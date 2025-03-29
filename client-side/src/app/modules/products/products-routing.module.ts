import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ViewProductsComponent} from "./view-products/view-products.component";
import {AddProductsComponent} from "./add-products/add-products.component";
import {EditProductsComponent} from "./edit-products/edit-products.component";
import {ViewDetailProductsComponent} from "./view-detail-products/view-detail-products.component";

const routes: Routes = [
  { path: '', redirectTo: 'view', pathMatch: 'full' },
  { path: 'view',component: ViewProductsComponent, title: 'NPK | Products'},
  { path: 'add', component: AddProductsComponent, title: 'NPK | Add Products'},
  { path: 'edit', component: EditProductsComponent, title: 'NPK | Update Products'},
  { path: 'details', component: ViewDetailProductsComponent, title: 'NPK | Product Details'}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
