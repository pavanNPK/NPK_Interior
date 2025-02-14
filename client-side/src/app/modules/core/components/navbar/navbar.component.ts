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
import { NgIf, NgOptimizedImage} from "@angular/common";
import {SidebarModule} from "primeng/sidebar";
import {AvatarModule} from "primeng/avatar";
import {Button} from "primeng/button";
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
    NgIf,
    NbTooltipModule,
    SidebarModule,
    AvatarModule,
    NbMenuModule,
    Button,
    OverlayPanelModule
  ],
  providers: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  items:NbMenuItem[] = [
    {title: 'Products', icon: 'layout-outline', link: '/products/view'},
    {title: 'Deals', icon: 'gift-outline', link: '/deals/view'},
    {title: 'Orders', icon: 'car-outline', link: '/orders/view'},
    {title: 'Upcoming', icon: 'calendar-outline', link: '/upcoming/view'},
    {title: 'Pay & Rewards', icon: 'award-outline', link: '/pay-rewards/view'},
    {title: 'Customer', icon: 'people-outline', link: '/customer/contact'},
    {title: 'Categories', icon: 'clipboard-outline', link: '/categories/view'},
    // {title: 'Wishlist', icon: 'people-outline', link: '/wishlist/view'},
  ]
  showProfile: boolean = false;
  sidebarVisible: boolean = false;
  constructor( ) {
  }
  ngOnInit(): void {

  }
}
