import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomeComponent} from "./home.component";
import {authGuard, authChildGuard} from "../../shared/gaurds/auth.guard";

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    children: [
      { path: 'products', loadChildren: () => import('../products/products.module').then(m => m.ProductsModule) },
      { path: 'dashboard', loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule) },
      { path: 'orders', loadChildren: () => import('../orders/orders.module').then(m => m.OrdersModule) },
      { path: 'pay-rewards', loadChildren: () => import('../pay-rewards/pay-rewards.module').then(m => m.PayRewardsModule) },
      { path: 'deals', loadChildren: () => import('../deals/deals.module').then(m => m.DealsModule) },
      { path: 'customer', loadChildren: () => import('../customer/customer.module').then(m => m.CustomerModule) },
      { path: 'upcoming', loadChildren: () => import('../upcoming/upcoming.module').then(m => m.UpcomingModule) },
      { path: 'cart', loadChildren: () => import('../cart/cart.module').then(m => m.CartModule) },
      { path: 'wishlist', loadChildren: () => import('../wishlist/wishlist.module').then(m => m.WishlistModule) },
      { path: 'settings', loadChildren: () => import('../settings/settings.module').then(m => m.SettingsModule) },
      { path: 'manage-account', loadChildren: () => import('../manage-account/manage-account.module').then(m => m.ManageAccountModule) },
      { path: 'categories', loadChildren: () => import('../categories/categories.module').then(m => m.CategoriesModule) },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
