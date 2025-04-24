import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ViewWishlistComponent} from "./view-wishlist/view-wishlist.component";
import {roleGuard} from "../../shared/gaurds/role.guard";

const routes: Routes = [
  { path: '', redirectTo: 'view', pathMatch: 'full' },
  {path: 'view', component: ViewWishlistComponent, canActivate: [roleGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WishlistRoutingModule { }
