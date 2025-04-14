import {Component, OnInit} from '@angular/core';
import {
  NbBadgeModule,
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
import {CookieService} from "ngx-cookie-service";
import {CartService} from "../../../../services/cart.service";
import {ResponseWithError} from "../../../../models/commonDTO";
import {ProductsDTO} from "../../../../models/productsDTO";

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
    DatePipe,
    NbBadgeModule
  ],
  providers: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  items:NbMenuItem[] = [
    {title: 'Dashboard', icon: 'home-outline', link: '/dashboard/view'},
    {title: 'Categories', icon: 'clipboard-outline', link: '/categories', pathMatch: 'prefix'},
    {title: 'Products', icon: 'layout-outline', link: '/products', pathMatch: 'prefix'},
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
  cartCount: any;
  wishlistCount: number = 0;
  constructor(private as: AuthService, private cookieService: CookieService, private cs: CartService) {
  }
  ngOnInit() {
    const storedUser = localStorage.getItem('user');
    this.userData = storedUser ? JSON.parse(storedUser) : null;
    // Get lastLoggedIn value directly
    this.lastLoggedIn = this.userData?._id
      ? JSON.parse(localStorage.getItem('lastLoggedIn') || '{}')[this.userData._id] || null
      : null;
    this.getCounts();
  }
  getCounts(){
    this.cs.getCartCount().subscribe({
      next: (response: ResponseWithError<any>) => {
        if (response.success) {
          this.cartCount = response.response || 0;
        } else {
          this.cartCount = 0;
        }
        console.log(this.cartCount);
      },
      error: (error: any) => {
        console.log('Cart count error', error)
      },
      complete: () => {
        // Set loading to false when complete
      },
    });
  }

  logOut() {
    this.as.logout();
    this.cookieService.delete('productData', '/');
  }

  openInNewTab(comPrivacyPolicy: string) {
    window.open(comPrivacyPolicy, '_blank');
  }
}
