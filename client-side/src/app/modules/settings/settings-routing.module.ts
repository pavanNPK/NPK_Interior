import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ViewSettingsComponent} from "./view-settings/view-settings.component";

const routes: Routes = [
  {path: 'view', component: ViewSettingsComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
