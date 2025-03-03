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
import {DatePipe, NgIf, NgOptimizedImage} from "@angular/common";
import {SidebarModule} from "primeng/sidebar";
import {AvatarModule} from "primeng/avatar";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {AuthService} from "../../../../services/auth.service";
import {UserDTO} from "../../../../models/userDTO";

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
    OverlayPanelModule,
    NgIf,
    DatePipe
  ],
  providers: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  items:NbMenuItem[] = [
    {title: 'Dashboard', icon: 'home-outline', link: '/dashboard/view'},
    {title: 'Categories', icon: 'clipboard-outline', link: '/categories/view'},
    {title: 'Products', icon: 'layout-outline', link: '/products/view'},
    {title: 'Deals', icon: 'gift-outline', link: '/deals/view'},
    {title: 'Upcoming', icon: 'calendar-outline', link: '/upcoming/view'},
    {title: 'Orders', icon: 'car-outline', link: '/orders/view'},
    {title: 'Pay & Rewards', icon: 'award-outline', link: '/pay-rewards/view'},
    {title: 'Customer', icon: 'people-outline', link: '/customer/contact'},
    {title: 'Wishlist', icon: 'heart-outline', link: '/wishlist/view'},
    {title: 'Cart', icon: 'shopping-bag-outline', link: '/cart/view'},
    {title: 'Settings', icon: 'settings-2-outline', link: '/settings/view'},
  ];
  showProfile: boolean = false;
  sidebarVisible: boolean = false;
  userData?: UserDTO | any;
  lastLoggedIn?: any;
  constructor(private as: AuthService) {
  }
  ngOnInit() {
    const storedUser = localStorage.getItem('user');
    this.userData = storedUser ? JSON.parse(storedUser) : null;
    // Get lastLoggedIn value directly
    this.lastLoggedIn = this.userData?._id
      ? JSON.parse(localStorage.getItem('lastLoggedIn') || '{}')[this.userData._id] || null
      : null;
  }

  logOut() {
    this.as.logout();
  }

  openInNewTab(comPrivacyPolicy: string) {
    window.open(comPrivacyPolicy, '_blank');
  }
}
