import {Component, OnInit} from '@angular/core';
import {ProductsService} from "../../../services/products.service";
import {ProductsDTO} from "../../../models/productsDTO";
import {ResponseWithError} from "../../../models/commonDTO";
import {CurrencyPipe, NgClass, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {NoDataComponent} from "../../core/components/no-data/no-data.component";
import {
  NbButtonModule,
  NbCardModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule,
  NbTooltipModule
} from "@nebular/theme";
import {RouterLink} from "@angular/router";
import {NbSharedModule} from "@nebular/theme/components/shared/shared.module";
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
    NgOptimizedImage,
    NgClass,
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
  productSearch = new FormControl('');
  constructor(private productsService: ProductsService) { }

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
}
