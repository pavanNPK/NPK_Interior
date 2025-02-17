import {Component, OnInit} from '@angular/core';
import {CategoriesDTO} from "../../../models/categoriesDTO";
import {CategoriesService} from "../../../services/categories.service";
import {ResponseWithError} from "../../../models/commonDTO";
import {
  NbAccordionModule,
  NbButtonModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule,
  NbTooltipModule,
  NbDialogService, NbCardModule, NbToastrService
} from "@nebular/theme";
import {RouterLink} from "@angular/router";
import {DividerModule} from "primeng/divider";
import {NgForOf, NgIf} from "@angular/common";
import {FormControl, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-view-categories',
  standalone: true,
  imports: [
    NbButtonModule,
    NbIconModule,
    NbTooltipModule,
    RouterLink,
    NbAccordionModule,
    NbInputModule,
    DividerModule,
    NgForOf,
    NgIf,
    NbFormFieldModule,
    ReactiveFormsModule,
    NbCardModule,
  ],
  templateUrl: './view-categories.component.html',
  styleUrl: './view-categories.component.scss'
})
export class ViewCategoriesComponent implements OnInit {
  loading: boolean = true;
  categories: CategoriesDTO[] = [];
  categorySearch = new FormControl('');
  whenSearch: boolean = false;
  catName: string = '';
  catId: string = '';
  constructor(private dialogService: NbDialogService,private categoriesService: CategoriesService,private toastService: NbToastrService,) { }
  ngOnInit(): void {
    this.loadCategories('', this.categorySearch.value ? this.categorySearch.value : '', false);
  }
  loadCategories(type: any, value: any, icon: boolean){
    this.loading = true;
    this.categoriesService.getCategories('', value).subscribe({
      next: (response: ResponseWithError<CategoriesDTO[]>) => {
        if (response.success)
          this.categories = response.response || [];
        else
          this.categories = [];
        this.loading = false;
        this.whenSearch = icon;
      },
      error: (error) => console.error('Error fetching products', error),
      complete: () => (this.loading = false),
    });
  }
  trimLeadingSpace(event: any) {
    const input = event.target;
    // Remove leading spaces only (but allow spaces between words)
    input.value = input.value.replace(/^\s+/, '');
    // Allow only alphabetic characters and spaces after a character has been entered
    input.value = input.value.replace(/[^a-zA-Z ]/g, '');
    input.dispatchEvent(new Event('input')); // Updates the form control
  }


  searchCategories() {
    if (this.categorySearch.value){
     this.loadCategories('', this.categorySearch.value, true);
    }
  }


  deleteCategory(_id: any, name: any, deleteCategoryDialog: any) {
    this.catId = _id;
    this.catName = name;
    this.dialogService.open(deleteCategoryDialog, {closeOnBackdropClick: false});
  }

  delete(ref: any) {
    this.categoriesService.deleteCategory(this.catId).subscribe(x => {
      if (x.success) {
        ref.close();
        this.loadCategories('', '', false)
        this.toastService.success('Successfully delete the Category', this.catName, {duration: 2000});
      } else {
        this.toastService.danger('Failed to delete the Category', this.catName, {duration: 2000});
        ref.close()
      }
    }, error => {
      this.toastService.danger(error, this.catName, {duration: 2000});
      ref.close()
    })
  }
}
