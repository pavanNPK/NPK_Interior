import {Component, OnInit} from '@angular/core';
import {CurrencyPipe, Location, NgClass, NgForOf, NgIf} from "@angular/common";
import {DividerModule} from "primeng/divider";
import {
  NbButtonModule,
  NbCardModule,
  NbDialogService,
  NbIconModule, NbProgressBarModule,
  NbToastrService,
  NbTooltipModule
} from "@nebular/theme";
import {NgxImageZoomModule} from "ngx-image-zoom";
import {EMIDetailsDTO, ProductsDTO} from "../../../models/productsDTO";
import {ActivatedRoute, Router} from "@angular/router";
import {ProductsService} from "../../../services/products.service";
import {ResponseWithError} from "../../../models/commonDTO";
import {EventService} from "../../../shared/services/event.service";

@Component({
  selector: 'app-view-detail-products',
  standalone: true,
  imports: [
    CurrencyPipe,
    DividerModule,
    NbButtonModule,
    NbCardModule,
    NbIconModule,
    NbTooltipModule,
    NgForOf,
    NgIf,
    NgxImageZoomModule,
    NgClass,
    NbProgressBarModule
  ],
  templateUrl: './view-detail-products.component.html',
  styleUrl: './view-detail-products.component.scss'
})
export class ViewDetailProductsComponent implements OnInit{

  slug: string = '';
  product?: ProductsDTO | any = {};
  loading: boolean = false;
  previewImage: string = '';
  emiDetails: EMIDetailsDTO[] = [];

  constructor(private location: Location,
              private router: Router,
              private route: ActivatedRoute,
              private ps: ProductsService,
              private toastService: NbToastrService,
              private eventService: EventService,
              private dialogService: NbDialogService) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(x => {
      this.slug = x['product'];
    })
    this.getProduct(this.slug);
  }

  getProduct(slug: string) {
    this.ps.getProductById(slug).subscribe({
      next: (response: ResponseWithError<ProductsDTO>) => {
        if (response.role !== 'notAllowed')
        {
          if (response.success)
            this.product = response.response || {};
          else
            this.product = {};
        } else {
          this.toastService.danger(`You don't have permission to create.`,  'Add Category', {duration: 2000});
        }
      },
      error: (error) => console.error('Error fetching products', error),
      complete: () => {
        if(this.product){
          this.previewImage = this.product.images[0].url;
        }
        this.loading = true;
      },
    })
  }

  backToPrev() {
    this.location.back();
  }
  copySharedLink() {
    navigator.clipboard.writeText(window.location.href);
    this.toastService.success('Link copied to clipboard', 'Success', {duration: 2000});
  }
  previewImgUrl(url: string){
    this.previewImage = url;
  }
  viewEMI(productEMIDialog: any, emiDetails: any) {
    this.emiDetails = emiDetails;
    this.dialogService.open(productEMIDialog, {closeOnBackdropClick: false});
  }

  storeCartAndFav(product: any, typeValue: boolean, type: any) {
    this.ps.addProductToCartOrWishlist(product, typeValue, type).subscribe({
      next: (response: ResponseWithError<any>) => {
        if (response.role !== 'notAllowed') {
          if (response.success) {
            // this.toastService.control(response.message, type, {duration: 2000});
          } else {
            this.toastService.danger(`Failed to add the product to ${type}`, type, {duration: 2000});
          }
        } else {
          this.toastService.danger(`You don't have permission to add to ${type}.`, type, {duration: 2000});
        }
      },
      error: (error) => {
        this.toastService.danger(error, this.product.name, {duration: 2000});
      },
      complete: () => {
        this.loading = true;
        this.getProduct(this.slug);
        this.eventService.triggerNavbar();
      }
    })
  }


  protected readonly Object = Object;
}
