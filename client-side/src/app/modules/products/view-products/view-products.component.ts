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
  loading: boolean = false;
  whenSearch: boolean = false;
  products: ProductsDTO[] = [];
  productName: string = '';
  productId: string = '';
  productSearch = new FormControl('');
  constructor(private productsService: ProductsService, private toastService: NbToastrService, private dialogService: NbDialogService) { }

  ngOnInit(): void {
    this.loadProducts();
  }
  loadProducts(){
    this.loading = true;
    this.productsService.getProducts().subscribe({
      next: (response: ResponseWithError<ProductsDTO[]>) => {
        if (response.success)
          this.products = response.response || [];
        else
          this.products = [];
        this.loading = false;
        console.log(this.products);
      },
      error: (error) => console.error('Error fetching products', error),
      complete: () => (this.loading = false),
    });
  }

  searchProducts() {

  }
  trimLeadingSpace(event: any) {
    const input = event.target;
    // Remove leading spaces only (but allow spaces between words)
    input.value = input.value.replace(/^\s+/, '');
    // Allow only alphabetic characters and spaces after a character has been entered
    input.value = input.value.replace(/[^a-zA-Z ]/g, '');
    input.dispatchEvent(new Event('input')); // Updates the form control
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
      }, complete: () => {this.loading = true; this.loadProducts();},
    })
  }
}
