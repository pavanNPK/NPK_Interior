import {Component, OnInit} from '@angular/core';
import {NgIf} from "@angular/common";
import {
  NbButtonModule,
  NbCardModule,
  NbIconModule,
  NbTabsetModule,
  NbTooltipModule
} from "@nebular/theme";
import {ProductsService} from "../../../services/products.service";
import {ResponseWithError} from "../../../models/commonDTO";
import {ProductsDTO} from "../../../models/productsDTO";
import {PaginationComponent} from "../../../shared/components/pagination/pagination.component";

@Component({
  selector: 'app-view-stock',
  standalone: true,
  imports: [
    NgIf,
    NbCardModule,
    NbTabsetModule,
    NbButtonModule,
    NbTooltipModule,
    NbIconModule,
    PaginationComponent
  ],
  templateUrl: './view-stock.component.html',
  styleUrl: './view-stock.component.scss'
})
export class ViewStockComponent implements OnInit {
  loading: boolean = true; // Start with true, we'll set to false when data is loaded

  allProducts: ProductsDTO[] = []; // All fetched products
  paginatedProducts: ProductsDTO[] = []; // Only the visible page
  perPage = 10;
  currentPage = 1;
  tabActiveValue = 'lowStock';

  tabHeaders = [
    { label: 'Low Stock', value: 'lowStock', tabIcon: 'alert-triangle-outline' },
    { label: 'Out of Stock', value: 'outOfStock', tabIcon: 'slash-outline' },
    { label: 'Applied Stock', value: 'appliedStock', tabIcon: 'checkmark-circle-2-outline' }
  ];

  constructor(private ps: ProductsService) {}

  ngOnInit(): void {
    this.getLowStockProducts(this.tabActiveValue);
  }

  getLowStockProducts(value: string) {
    this.loading = true; // Set loading to true when starting to fetch data
    this.ps.getLowStockProducts(value).subscribe({
      next: (res: ResponseWithError<ProductsDTO[]>) => {
        if (res.success) {
          this.allProducts = res.response || [];
          this.currentPage = 1;
          this.updateDisplayedData();
        }
      },
      error: (error: any) => {
        console.error('Error fetching products:', error);
        this.loading = false; // Set loading to false on error
      },
      complete: () => {
        this.loading = false; // Set loading to false when data is loaded
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.updateDisplayedData();
  }

  onPerPageChange(count: number) {
    this.perPage = count;
    this.currentPage = 1;
    this.updateDisplayedData();
  }

  updateDisplayedData() {
    const start = (this.currentPage - 1) * this.perPage;
    const end = start + this.perPage;
    this.paginatedProducts = this.allProducts.slice(start, end);
  }

  getTabData(value: string) {
    this.tabActiveValue = value;
    this.getLowStockProducts(value);
  }
}
