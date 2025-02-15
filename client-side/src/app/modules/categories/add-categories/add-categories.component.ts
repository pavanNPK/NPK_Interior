import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {Location, NgClass, NgForOf, NgIf} from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import {
  NbButtonModule,
  NbCheckboxModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule, NbToastrService,
  NbTooltipModule
} from '@nebular/theme';
import { ReactiveFormsModule } from '@angular/forms';
import {ToggleButtonModule} from "primeng/togglebutton";
import {DividerModule} from "primeng/divider";
import {CategoriesService} from "../../../services/categories.service";
import {ResponseWithError} from "../../../models/commonDTO";
import {CategoriesDTO} from "../../../models/categoriesDTO";
import {NgbTypeahead} from "@ng-bootstrap/ng-bootstrap";
import {
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  OperatorFunction,
} from "rxjs";

@Component({
  selector: 'app-add-categories',
  standalone: true,
  imports: [
    NbButtonModule,
    NbIconModule,
    NbTooltipModule,
    ReactiveFormsModule,
    NbInputModule,
    NgIf,
    NgForOf,
    ToggleButtonModule,
    NbCheckboxModule,
    DividerModule,
    NgClass,
    NbFormFieldModule,
    NgbTypeahead
  ],
  templateUrl: './add-categories.component.html',
  styleUrl: './add-categories.component.scss'
})
export class AddCategoriesComponent implements OnInit {
  addCategoriesForm!: FormGroup;
  loading: boolean = false;
  submitted: boolean = false;
  categoriesDTO: CategoriesDTO[] = [];

  constructor(private location: Location,
              private fb: FormBuilder,
              private cs: CategoriesService,
              private router: Router,
              private toastService: NbToastrService,) {}

  ngOnInit() {
    this.loadCategories();
  }
  loadCategories() {
    this.cs.getCategories('loadCategories').subscribe({
      next: (response: ResponseWithError<CategoriesDTO[]>) => {
        if (response.success)
          this.categoriesDTO = response.response || [];
        else
          this.categoriesDTO = [];
        this.loading = false;
        this.loadForm();
      },
      error: (error) => console.error('Error fetching products', error),
      complete: () => (this.loading = true),
    });
  }
  loadForm() {
    this.addCategoriesForm = this.fb.group({
      categories: this.fb.array([]) // Initialize the categories array
    });

    // Add an initial category with a subcategory
    this.addCategory();
  }

  // Getter for Categories FormArray
  get categories(): FormArray {
    return this.addCategoriesForm.get('categories') as FormArray;
  }

  // Getter for Subcategories FormArray inside a category
  getSubcategories(categoryIndex: number): FormArray {
    return this.categories.at(categoryIndex).get('subcategories') as FormArray;
  }

  // Create a new category with an empty subcategories array
  createCategory(): FormGroup {
    return this.fb.group({
      _id: [''],
      name: ['', Validators.required],
      description: [''],
      enableSubCategory: [false],
      subcategories: this.fb.array([]) // Each category has a FormArray of subcategories
    });
  }

  // Create a new subcategory form group
  createSubcategory(): FormGroup {
    return this.fb.group({
      name: [''],
      description: [''],
    });
  }

  // Add a new category
  addCategory() {
    const category = this.createCategory();
    this.categories.push(category);

    // Add an initial subcategory
    this.getSubcategories(this.categories.length - 1).push(this.createSubcategory());
  }

  // Remove a category
  removeCategory(index: number) {
    this.categories.removeAt(index);
  }

  // Add a subcategory to a specific category
  addSubcategory(categoryIndex: number) {
    const subcategory = this.createSubcategory();
    this.getSubcategories(categoryIndex).push(subcategory);

    // Apply validation if subcategories are enabled
    if (this.categories.at(categoryIndex).get('enableSubCategory')?.value) {
      this.subCategoriesValidation(categoryIndex, true);
    }
  }


  // Remove a subcategory from a specific category
  removeSubcategory(categoryIndex: number, subcategoryIndex: number) {
    this.getSubcategories(categoryIndex).removeAt(subcategoryIndex);
  }

  // Go back to the previous page
  backToPrev() {
    this.location.back();
  }
  // **Category Search ngbTypeahead script ** //
  // **Optional ** //
  categorySearch: OperatorFunction<string, CategoriesDTO[]> = (text$: Observable<string>) => {
    return text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((searchText: string) => {
        if (!searchText) {
          return [];
        }
        return this.categoriesDTO.filter((category: any) =>
          category.name.toLowerCase().includes(searchText.toLowerCase())
        );
      })
    );
  };

  categoryFormatter = (category: CategoriesDTO) => {
    return category && category.name ? category.name : ''; // Ensure it returns a string
  };

  // Submit the form
  addCategories() {
    this.submitted = true;
    if (this.addCategoriesForm.invalid) {
      return;
    } else {
      const formValues = this.addCategoriesForm.value;
      const categories: CategoriesDTO[] = formValues.categories.map(
        (category: any) => {
          const data = new CategoriesDTO();
          data.name = category.name.name ? category.name.name : category.name;
          data.description = category.description;
          if(category._id){
            data._id = category._id;
          }
          if (category.enableSubCategory) {
            data.subCategories = category.subcategories;
          }
          return data;
        }
      );
      this.cs.addCategory(categories).subscribe({
        next: (response: ResponseWithError<CategoriesDTO[]>) => {
          if (response.success){
            this.submitted = false;
            this.addCategoriesForm.reset();
            this.router.navigate(['/categories/view']);
            this.toastService.success('Successfully added new categories', 'Categories', {duration: 2000});
          }
          else{
            this.toastService.danger('Failed to add new categories', 'Categories', {duration: 2000});
          }
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.addCategoriesForm.reset();
          this.submitted = false;
          this.toastService.danger('Failed to add new categories', 'Categories', {duration: 2000});
        },
        complete: () => (this.loading = true),
      })
    }
  }

  subCategoriesValidation(i: number, value: boolean) {
    const subcategories = this.getSubcategories(i); // Get subcategories FormArray
    if (!subcategories) return; // Ensure it exists

    subcategories.controls.forEach(subCategory => {
      const nameControl = subCategory.get('name');
      if (nameControl) {
        if (value) {
          nameControl.setValidators(Validators.required);
        } else {
          nameControl.clearValidators();
        }
        nameControl.updateValueAndValidity();
        nameControl.markAsTouched();
        nameControl.markAsDirty();
      }
    });
  }


  categorySelected(event: any, i: number) {
    let category = this.categories.at(i);
    if (category) {
      category.get('name')?.setValue(event.name.name);
      category.get('_id')?.setValue(event._id);
      category.get('description')?.setValue(event.description);
    }
  }

  trimLeadingSpace(event: any) {
    const input = event.target;
    input.value = input.value.replace(/^\s+/, ''); // Removes leading spaces only
    input.dispatchEvent(new Event('input')); // Updates the form control
  }

  resetCategoryName(i: number) {
    const category = this.categories.at(i);
    if (category && category.get('name')) {
      category.get('name')!.setValue('');
      category.get('description')!.setValue('');
      category.get('_id')!.setValue('');
    }
  }
}
