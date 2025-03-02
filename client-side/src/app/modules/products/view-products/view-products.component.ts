import {Component, OnInit} from '@angular/core';
import {ProductsService} from "../../../services/products.service";
import {ProductsDTO} from "../../../models/productsDTO";
import {ResponseWithError} from "../../../models/commonDTO";
import {NgForOf, NgIf} from "@angular/common";
import {NoDataComponent} from "../../core/components/no-data/no-data.component";

@Component({
  selector: 'app-view-products',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    NoDataComponent
  ],
  templateUrl: './view-products.component.html',
  styleUrl: './view-products.component.scss'
})
export class ViewProductsComponent implements OnInit {
  loading: boolean = false;
  products: ProductsDTO[] = [];
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
      },
      error: (error) => console.error('Error fetching products', error),
      complete: () => (this.loading = false),
    });
  }
}
