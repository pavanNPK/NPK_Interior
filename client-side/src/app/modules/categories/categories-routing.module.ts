import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ViewCategoriesComponent} from "./view-categories/view-categories.component";
import {AddCategoriesComponent} from "./add-categories/add-categories.component";
import {EditCategoriesComponent} from "./edit-categories/edit-categories.component";

const routes: Routes = [
  { path: '', redirectTo: 'view', pathMatch: 'full' },
  { path: 'view', component: ViewCategoriesComponent, title: 'NPK | Categories' },
  { path: 'add', component: AddCategoriesComponent, title: 'NPK | Add Categories' },
  { path: 'update', component: EditCategoriesComponent, title: 'NPK | Update Categories' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoriesRoutingModule { }
