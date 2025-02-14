import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ViewProductsComponent} from "./view-products/view-products.component";
import {AddProductsComponent} from "./add-products/add-products.component";
import {EditProductsComponent} from "./edit-products/edit-products.component";

const routes: Routes = [
  {
    path: 'view',
    component: ViewProductsComponent
  },
  {
    path: 'add',
    component: AddProductsComponent
  },
  {
    path: 'edit',
    component: EditProductsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
