import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  ChangeDetectionStrategy, OnInit
} from '@angular/core';
import {NgClass, NgForOf, NgOptimizedImage} from "@angular/common";
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {
  NbButtonModule,
  NbCardModule, NbDialogService,
  NbIconModule, NbInputModule,
  NbSelectModule,
  NbSpinnerModule,
  NbTooltipModule
} from "@nebular/theme";
import {WholesalersDTO} from "../../../models/wholesalersDTO";
import {NoDataComponent} from "../../../modules/core/components/no-data/no-data.component";
import {ProductsService} from "../../../services/products.service";

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [NgForOf, FormsModule, NbSelectModule, NbButtonModule, NbSpinnerModule, NbIconModule, NbTooltipModule, NoDataComponent, NgOptimizedImage, NbCardModule, ReactiveFormsModule, NbInputModule, NgClass],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent implements OnInit, OnChanges {
  @Input() totalRecords = 0;
  @Input() perPage = 10;
  @Input() currentPage = 1;
  @Input() paginationData: any;
  @Input() tabTypeData: string = '';
  @Input() isLoading: boolean = false;
  searchWholesaler = new FormControl('');
  requiredQuantity = new FormControl('', Validators.required);
  @Output() pageChanged = new EventEmitter<number>();
  @Output() perPageChanged = new EventEmitter<number>();

  totalPages = 0;
  pages: number[] = [];
  wholesalersList: WholesalersDTO[] | undefined = [];
  visiblePages: number[] = [];
  pageSizeOptions = [50, 100, 200, 500];
  productId: any;

  constructor(private cd: ChangeDetectorRef, private ps: ProductsService ,private dialogService: NbDialogService) {}

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalRecords'] || changes['perPage']) {
      this.updatePagination();
    }

    if (changes['paginationData']) {
      this.cd.markForCheck();
    }
  }

  private updatePagination(): void {
    this.totalPages = Math.max(1, Math.ceil(this.totalRecords / this.perPage));
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

    // Calculate visible page buttons (show max 5 pages around current page)
    this.calculateVisiblePages();

    this.cd.markForCheck();
  }

  private calculateVisiblePages(): void {
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      // Show all pages if we have fewer than maxVisiblePages
      this.visiblePages = [...this.pages];
      return;
    }

    // Calculate visible range centered around current page
    let start = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let end = start + maxVisiblePages - 1;

    // Adjust if we're near the end
    if (end > this.totalPages) {
      end = this.totalPages;
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    this.visiblePages = this.pages.slice(start - 1, end);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.pageChanged.emit(this.currentPage);
    this.calculateVisiblePages();
  }

  onPerPageChange(count: number): void {
    this.perPage = count;
    this.perPageChanged.emit(count);
  }

  protected readonly Math = Math;
  protected readonly Number = Number;

  getRemainingWholesalersInfo(wholesalers: any[]): string {
    return wholesalers.map(w => `${w.name} - (${w.email})`).join('\n');
  }
  assignWholesalers(wholesalersListPopup: any, item: any) {
    this.productId = item._id;
    this.wholesalersList = item.wholesalers;
    console.log(this.wholesalersList)
    this.dialogService.open(wholesalersListPopup, {closeOnBackdropClick: false});
  }

  saveAssigners(ref:any) {
    this.requiredQuantity.setValidators(Validators.required);
    this.requiredQuantity.updateValueAndValidity();
    console.log(this.requiredQuantity.value)
    let data = {
      wholesalers: this.wholesalersList?.map((x: any) => x.selected ? x._id : null).filter((x: any) => x !== null),
      requiredQuantity: this.requiredQuantity.value ? Number(this.requiredQuantity.value) : undefined
    }
    if (data.requiredQuantity) {
      // @ts-ignore
      console.log(data)
      this.ps.updateProductStock(this.productId, data).subscribe({
        next: (response) => {
        },
        error: (error) => console.error('Error fetching wholesalers', error),
        complete: () => {
          ref.close();
        }
      })
    } else {
      this.requiredQuantity.markAsTouched();
      this.requiredQuantity.markAsDirty();
    }
  }
}
