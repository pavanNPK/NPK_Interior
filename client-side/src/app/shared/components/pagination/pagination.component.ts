import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import { FormsModule } from "@angular/forms";
import {NbButtonModule, NbIconModule, NbSelectModule, NbSpinnerModule, NbTooltipModule} from "@nebular/theme";

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [NgForOf, FormsModule, NbSelectModule, NbButtonModule, NgIf, NbSpinnerModule, NbIconModule, NbTooltipModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent implements OnChanges {
  @Input() totalRecords = 0;
  @Input() perPage = 10;
  @Input() currentPage = 1;
  @Input() paginationData: any;
  @Input() tabTypeData: string = '';
  @Input() isLoading: boolean = false;

  @Output() pageChanged = new EventEmitter<number>();
  @Output() perPageChanged = new EventEmitter<number>();

  totalPages = 0;
  pages: number[] = [];
  visiblePages: number[] = [];
  pageSizeOptions = [1, 2, 3, 4, 5, 8, 10, 20, 30, 50, 100];

  constructor(private cd: ChangeDetectorRef) {}

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

  trackById(index: number, item: any): string {
    return item._id || index.toString(); // Fallback to index if _id is not available
  }
}
