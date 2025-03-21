import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ViewManageAccountComponent} from "./view-manage-account/view-manage-account.component";

const routes: Routes = [
  {path: 'config', component: ViewManageAccountComponent, title: 'NPK | Account'}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageAccountRoutingModule { }
