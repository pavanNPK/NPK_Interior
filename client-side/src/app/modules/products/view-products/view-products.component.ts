import {Component, inject, OnInit} from '@angular/core';
import {ProductsService} from "../../../services/products.service";
import {ProductsDTO} from "../../../models/productsDTO";
import {ResponseWithError} from "../../../models/commonDTO";
import {CurrencyPipe, NgForOf, NgIf} from "@angular/common";
import {NoDataComponent} from "../../core/components/no-data/no-data.component";
import {
  NbButtonModule,
  NbCardModule,
  NbDialogService,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule,
  NbToastrService,
  NbTooltipModule
} from "@nebular/theme";
import {RouterLink} from "@angular/router";
import {FormControl, ReactiveFormsModule} from "@angular/forms";
import {DataViewModule} from "primeng/dataview";
import {UserDTO} from "../../../models/userDTO";
import {EventService} from "../../../shared/services/event.service";
import {AuthService} from "../../../services/auth.service";

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
  pgSize: number = 50;
  private authS = inject(AuthService)
  showAction: boolean = this.authS.giveAccess;
  constructor(private productsService: ProductsService,
              private toastService: NbToastrService,
              private eventService: EventService,
              private dialogService: NbDialogService)
  {
    this.userData = this.authS.currentUserValue || null;
  }

  ngOnInit(): void {
    this.loadProducts(this.productSearch.value ? this.productSearch.value : '', false);
  }
  loadProducts(search: string, icon: boolean) {
    // Set loading to true at the start
    this.loading = true;

    this.productsService.getProducts(search).subscribe({
      next: (response: ResponseWithError<ProductsDTO[]>) => {
        if (response.success) {
          this.products = response.response || [];
        } else {
          this.products = [];
        }
      },
      error: (error: any) => {
        this.toastService.danger(error, 'Error fetching products', {duration: 2000});
      },
      complete: () => {
        // Set loading to false when complete
        this.loading = false;
        this.whenSearch = icon;
        this.eventService.triggerNavbar();
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
  storeCartAndFav(product: any, typeValue: boolean, type: any) {
    this.productsService.addProductToCartOrWishlist(product, typeValue, type).subscribe({
      next: (response: ResponseWithError<any>) => {
        if (response.success) {
          // this.toastService.control(response.message, type, {duration: 2000});
        } else {
          this.toastService.danger(response.message, type, {duration: 2000});
        }
      },
      error: (error) => {
        this.toastService.danger(error, this.productName, {duration: 2000});
      },
      complete: () => {
        this.loading = true;
        this.loadProducts(this.productSearch.value || '', !!this.productSearch.value);
      }
    })
  }
  notifyUserForProduct(product: any, typeValue: boolean) {
    this.productsService.notifyUserForProduct(product._id, typeValue).subscribe({
      next: (response: ResponseWithError<any>) => {
        if (response.success) {
          this.toastService.success(response.message, product.name, {duration: 2000});
        } else {
          this.toastService.danger('Failed to notify the Product', product.name, {duration: 2000});
        }
      },
      error: (error) => {
        this.toastService.danger(error, this.productName, {duration: 2000});
      },
      complete: () => {
        this.loading = true;
        this.loadProducts(this.productSearch.value || '', !!this.productSearch.value);
        this.eventService.triggerNavbar();
      }
    })
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
        if (response.success) {
          this.toastService.success('Successfully delete the Product', this.productName, {duration: 2000});
        } else {
          this.toastService.danger('Failed to delete the Product', this.productName, {duration: 2000});
        }
      },
      error: (error) => {
        this.toastService.danger(error, this.productName, {duration: 2000});
      }, complete: () => {this.loading = true; this.loadProducts(this.productSearch.value ? this.productSearch.value : '', false);},
    })
  }
}
