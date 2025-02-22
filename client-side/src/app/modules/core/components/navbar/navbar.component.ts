import {Component, OnInit} from '@angular/core';
import {
  NbButtonModule,
  NbContextMenuModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule,
  NbMenuItem, NbMenuModule, NbTooltipModule,
  NbUserModule
} from "@nebular/theme";
import {RouterLink} from "@angular/router";
import {MenuModule} from "primeng/menu";
import {DividerModule} from "primeng/divider";
import {NgOptimizedImage} from "@angular/common";
import {SidebarModule} from "primeng/sidebar";
import {AvatarModule} from "primeng/avatar";
import {OverlayPanelModule} from "primeng/overlaypanel";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    NbFormFieldModule,
    NbIconModule,
    NbInputModule,
    NbContextMenuModule,
    RouterLink,
    NbUserModule,
    MenuModule,
    NbButtonModule,
    DividerModule,
    NgOptimizedImage,
    NbTooltipModule,
    SidebarModule,
    AvatarModule,
    NbMenuModule,
    OverlayPanelModule
  ],
  providers: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  items:NbMenuItem[] = [
    {title: 'Categories', icon: 'clipboard-outline', link: '/categories/view'},
    {title: 'Products', icon: 'layout-outline', link: '/products/view'},
    {title: 'Deals', icon: 'gift-outline', link: '/deals/view'},
    {title: 'Upcoming', icon: 'calendar-outline', link: '/upcoming/view'},
    {title: 'Orders', icon: 'car-outline', link: '/orders/view'},
    {title: 'Pay & Rewards', icon: 'award-outline', link: '/pay-rewards/view'},
    {title: 'Customer', icon: 'people-outline', link: '/customer/contact'},
    // {title: 'Wishlist', icon: 'people-outline', link: '/wishlist/view'},
  ]
  showProfile: boolean = false;
  sidebarVisible: boolean = false;
  constructor( ) {
  }
  ngOnInit(): void {

  }
}
