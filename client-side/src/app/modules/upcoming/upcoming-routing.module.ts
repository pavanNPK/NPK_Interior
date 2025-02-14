import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ViewUpcomingComponent} from "./view-upcoming/view-upcoming.component";

const routes: Routes = [
  {path: 'view', component: ViewUpcomingComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UpcomingRoutingModule { }
