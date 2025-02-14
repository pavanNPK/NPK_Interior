import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ViewPayRewardsComponent} from "./view-pay-rewards/view-pay-rewards.component";

const routes: Routes = [
  {path: 'view', component: ViewPayRewardsComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PayRewardsRoutingModule { }
