import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ViewBoardComponent} from "./view-board/view-board.component";

const routes: Routes = [
  {path: 'view', component: ViewBoardComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
