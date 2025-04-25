import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {roleGuard} from "../../shared/gaurds/role.guard";
import {ViewWholesalersComponent} from "./view-wholesalers/view-wholesalers.component";
import {AddWholesalersComponent} from "./add-wholesalers/add-wholesalers.component";
import {EditWholesalersComponent} from "./edit-wholesalers/edit-wholesalers.component";

const routes: Routes = [
  { path: '', redirectTo: 'view', pathMatch: 'full' },
  { path: 'view', component: ViewWholesalersComponent, title: 'NPK | Wholesalers', canActivate: [roleGuard] },
  { path: 'add', component: AddWholesalersComponent, title: 'NPK | Add Wholesalers', canActivate: [roleGuard] },
  { path: 'edit', component: EditWholesalersComponent, title: 'NPK | Update Wholesalers', canActivate: [roleGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WholesalersRoutingModule { }
