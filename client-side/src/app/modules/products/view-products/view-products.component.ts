import {Component, OnInit} from '@angular/core';
import {ProductsService} from "../../../services/products.service";
import {ProductsDTO} from "../../../models/productsDTO";
import {ResponseWithError} from "../../../models/commonDTO";
import {CurrencyPipe, NgForOf, NgIf} from "@angular/common";
import {NoDataComponent} from "../../core/components/no-data/no-data.component";
import {
  NbButtonModule,
  NbCardModule, NbDialogService,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule, NbToastrService,
  NbTooltipModule
} from "@nebular/theme";
import {RouterLink} from "@angular/router";
import {FormControl, ReactiveFormsModule} from "@angular/forms";
import {DataViewModule} from "primeng/dataview";
import {UserDTO} from "../../../models/userDTO";
import {CookieService} from "ngx-cookie-service";

@Component({
  selector: 'app-view-products',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    NoDataComponent,
    NbIconModule,
    NbTooltipModule,
    NbButtonModule,
    RouterLink,
    NbFormFieldModule,
    NbInputModule,
    ReactiveFormsModule,
    DataViewModule,
    NbCardModule,
    CurrencyPipe
  ],
  templateUrl: './view-products.component.html',
  styleUrl: './view-products.component.scss'
})
export class ViewProductsComponent implements OnInit {
  loading: boolean = true;
  whenSearch: boolean | undefined = false;
  products: ProductsDTO[] = [];
  productName: string = '';
  productId: string = '';
  userData?: UserDTO | any;
  productSearch = new FormControl('');
  productData: any = {};
  constructor(private productsService: ProductsService,
              private toastService: NbToastrService,
              private cookieService: CookieService,
              private dialogService: NbDialogService)
  {
    const storedUser = localStorage.getItem('user');
    this.userData = storedUser ? JSON.parse(storedUser) : null;
  }

  ngOnInit(): void {
    // Initialize with default values
    this.productData = {
      userId : this.userData._id,
      cart: [],
      wishlist: []
    }
    try {
      const cookieData = this.cookieService.get('productData');
      if (cookieData && cookieData.trim() !== '') {
        this.productData = JSON.parse(cookieData);
        console.log('Loaded initial product data from cookies:', this.productData);
      } else {
        console.log('No cookie data found on init, using default productData');
      }
    } catch (error) {
      console.error('Error parsing cookie data on init', error);
    }
    this.loadProducts(this.productSearch.value ? this.productSearch.value : '', false);
  }
  loadProducts(search: string, icon: boolean) {
    // Set loading to true at the start
    this.loading = true;

    this.productsService.getProducts(search).subscribe({
      next: (response: ResponseWithError<ProductsDTO[]>) => {
        if (response.success) {
          this.products = response.response || [];

          // Only update from cookies if we haven't already loaded data
          if (!this.productData || (!this.productData.cart?.length && !this.productData.wishlist?.length)) {
            try {
              const cookieData = this.cookieService.get('productData');
              if (cookieData && cookieData.trim() !== '') {
                this.productData = JSON.parse(cookieData);
                console.log('Updated product data from cookies:', this.productData);
              }
            } catch (error) {
              console.error('Error parsing cookie data', error);
            }
          }
        } else {
          this.products = [];
        }
        console.log(this.products);
      },
      error: (error: any) => {
        this.toastService.danger(error, 'Error fetching products', {duration: 2000});
      },
      complete: () => {
        // Set loading to false when complete
        this.loading = false;
        this.whenSearch = icon;
      },
    });
  }
  searchProducts() {
    if (this.productSearch.value){
      this.loadProducts(this.productSearch.value, true);
    }
  }
  trimLeadingSpace(event: any) {
    const input = event.target;
    // Remove leading spaces only (but allow spaces between words)
    input.value = input.value.replace(/^\s+/, '');
    // Allow only alphabetic characters and spaces after a character has been entered
    input.value = input.value.replace(/[^a-zA-Z ]/g, '');
    input.dispatchEvent(new Event('input')); // Updates the form control
  }
  storeCartAndFav(product: ProductsDTO, type: any) {
    if(type === 'cart') {
      if (this.productData.cart.includes(product._id))
        this.productData.cart.splice(this.productData.cart.indexOf(product._id), 1);
      else
        this.productData.cart.push(product._id);
    } else {
      if (this.productData.wishlist.includes(product._id))
        this.productData.wishlist.splice(this.productData.wishlist.indexOf(product._id), 1);
      else
        this.productData.wishlist.push(product._id);
    }

    // Set the cookie with explicit path to ensure it's accessible
    this.cookieService.set('productData', JSON.stringify(this.productData));

    console.log('Stored in cookie:', JSON.stringify(this.productData));
  }
  removeProduct(removeProductDialog: any, name: string, id: string) {
    this.productName = name;
    this.productId = id;
    this.dialogService.open(removeProductDialog, {closeOnBackdropClick: false});
  }
  delete(ref: any) {
    ref.close();
    this.productsService.deleteProduct(this.productId).subscribe({
      next: (response: ResponseWithError<any>) => {
        if (response.role !== 'notAllowed') {
          if (response.success) {
            this.toastService.success('Successfully delete the Product', this.productName, {duration: 2000});
          } else {
            this.toastService.danger('Failed to delete the Product', this.productName, {duration: 2000});
          }
        } else {
          this.toastService.danger(`You don't have permission to delete.`,  `${this.productName}`, {duration: 2000});
        }
      },
      error: (error) => {
        this.toastService.danger(error, this.productName, {duration: 2000});
      }, complete: () => {this.loading = true; this.loadProducts(this.productSearch.value ? this.productSearch.value : '', false);},
    })
  }
}
