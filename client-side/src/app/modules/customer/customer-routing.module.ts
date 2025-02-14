import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {CustomerCareComponent} from "./customer-care/customer-care.component";

const routes: Routes = [
  {path: 'contact', component: CustomerCareComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
