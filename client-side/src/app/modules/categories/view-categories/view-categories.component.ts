import {Component, inject, OnInit} from '@angular/core';
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
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NoDataComponent} from "../../core/components/no-data/no-data.component";
import {AuthService} from "../../../services/auth.service";

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
    NoDataComponent,
    DatePipe,
    NgClass,
  ],
  templateUrl: './view-categories.component.html',
  styleUrl: './view-categories.component.scss'
})
export class ViewCategoriesComponent implements OnInit {
  loading: boolean = false;
  categories: CategoriesDTO[] = [];
  categorySearch = new FormControl('');
  whenSearch: boolean = false;
  loadForm: boolean = false;
  submitted: boolean = false;
  catType: string = '';
  catName: string = '';
  catId: string = '';
  categoryForm?: FormGroup | any;
  private authS = inject(AuthService)
  showAction: boolean = this.authS.giveAccess;
  constructor(private dialogService: NbDialogService,
              private categoriesService: CategoriesService,
              private toastService: NbToastrService,
              private fb: FormBuilder) { }
  get c(){
    return this.categoryForm?.controls;
  }
  ngOnInit(): void {
    this.loadCategories('', this.categorySearch.value ? this.categorySearch.value : '', false);
  }
  loadCategories(type: any, value: any, icon: boolean){
    this.categoriesService.getCategories('', value).subscribe({
      next: (response: ResponseWithError<CategoriesDTO[]>) => {
        if (response.success){
          this.categories = response.response || [];
        } else{
          this.categories = [];
        }
        this.whenSearch = icon;
      },
      error: (error) => console.error('Error fetching products', error),
      complete: () => (this.loading = true),
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


  deleteCategory(_id: any, name: any, deleteCategoryDialog: any, type: string) {
    this.catId = _id;
    this.catName = name;
    this.catType = type;
    this.dialogService.open(deleteCategoryDialog, {closeOnBackdropClick: false});
  }

  delete(ref: any) {
    this.categoriesService.deleteCategory(this.catId, this.catType).subscribe( {
      next: (response: ResponseWithError<any>) => {
        if (response.success) {
          this.toastService.success('Successfully delete the Category', this.catName, {duration: 2000});
          this.loadCategories('', '', false);
          ref.close();
        } else {
          this.toastService.danger('Failed to delete the Category', this.catName, {duration: 2000});
        }
      },
      error: (error) => {
        this.toastService.danger(error, this.catName, {duration: 2000});
        ref.close()
      }, complete: () => {this.loading = true; this.loadForm = false; ref.close()},
    })
  }

  updateCatSubCat(data: any, updateCategorySubCatDialog: any, type: string) {
    this.catId = data._id;
    this.catName = data.name;
    this.catType = type;
    this.categoryForm = this.fb.group({
      name: [data.name, Validators.required],
      description: [data.description],
      _id: [data._id],
      updatedOn: [new Date()]
    })
    this.loadForm = true;
    this.dialogService.open(updateCategorySubCatDialog, {closeOnBackdropClick: false});
  }

  updateCategory(ref:any) {
    this.submitted = true;
    if (this.categoryForm.invalid) {
      return;
    } else {
      const formValues = this.categoryForm.value;
      this.categoriesService.updateCategory(formValues, this.catType).subscribe({
        next: (response: ResponseWithError<CategoriesDTO>) => {
          if (response.success){
            this.loadCategories('', '', false);
            this.loadForm = false;
            this.submitted = false;
            this.categorySearch.setValue('');
            ref.close();
            this.toastService.success(`Successfully updated the ${this.catType}`, this.catName, {duration: 2000});
          }
          else{
            this.toastService.danger(`Failed to update the ${this.catType}`, this.catName, {duration: 2000});
          }
        },
        error: (error: any) => {
          this.toastService.danger(error, this.catName, {duration: 2000});
        },
        complete: () => {
          this.loading = true;
          this.loadForm = false;
          ref.close();
        },
      })
    }
  }

  viewProducts(id: string | undefined) {

  }
}
