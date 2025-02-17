import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ViewCategoriesComponent} from "./view-categories/view-categories.component";
import {AddCategoriesComponent} from "./add-categories/add-categories.component";
import {EditCategoriesComponent} from "./edit-categories/edit-categories.component";

const routes: Routes = [
  {path: 'view', component: ViewCategoriesComponent},
  {path: 'add', component: AddCategoriesComponent},
  {path: 'update', component: EditCategoriesComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoriesRoutingModule { }
