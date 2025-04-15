import {Component, OnInit, OnDestroy} from '@angular/core';
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
import {EventService} from "../../../../shared/services/event.service";
import {forkJoin, Subscription} from "rxjs";
import {ResponseWithError} from "../../../../models/commonDTO";
import { WishlistService } from '../../../../services/wishlist.service';

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
export class NavbarComponent implements OnInit, OnDestroy {
  private eventSub!: Subscription;
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
  wishlistCount: any;
  constructor(private as: AuthService,
              private cookieService: CookieService,
              private cs: CartService,
              private ws: WishlistService,
              private eventService: EventService) {
  }
  ngOnInit() {
    const storedUser = localStorage.getItem('user');
    this.userData = storedUser ? JSON.parse(storedUser) : null;
    // Get lastLoggedIn value directly
    this.lastLoggedIn = this.userData?._id
      ? JSON.parse(localStorage.getItem('lastLoggedIn') || '{}')[this.userData._id] || null
      : null;
    this.eventSub = this.eventService.navbarTrigger$.subscribe(() => {
      this.getCounts();
    });
  }
  getCounts(){
    forkJoin(this.ws.getWishlistCount(), this.cs.getCartCount()).subscribe({
      next: (response: [ResponseWithError<any>, ResponseWithError<any>]) => {
        if (response[0].success) {
          this.wishlistCount = response[0].response || 0;
        }
        if (response[1].success) {
          this.cartCount = response[1].response || 0;
        }
      },
      error: (error) => console.error('Error fetching products', error),
      complete: () => {
      },
    })
  }

  logOut() {
    this.as.logout();
    this.cookieService.delete('productData', '/');
  }

  openInNewTab(comPrivacyPolicy: string) {
    window.open(comPrivacyPolicy, '_blank');
  }
  ngOnDestroy(): void {
    if (this.eventSub) {
      this.eventSub.unsubscribe();
    }
  }
}
