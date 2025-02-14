import { Component, OnInit } from '@angular/core';
import {Location, NgClass, NgForOf, NgIf} from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import {
  NbButtonModule,
  NbCheckboxModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule,
  NbTooltipModule
} from '@nebular/theme';
import { ReactiveFormsModule } from '@angular/forms';
import {ToggleButtonModule} from "primeng/togglebutton";
import {DividerModule} from "primeng/divider";

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
    NbFormFieldModule
  ],
  templateUrl: './add-categories.component.html',
  styleUrl: './add-categories.component.scss'
})
export class AddCategoriesComponent implements OnInit {
  addCategoriesForm!: FormGroup;

  constructor(private location: Location, private fb: FormBuilder) {}

  ngOnInit() {
    this.loadForm();
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
      name: ['', Validators.required],
      description: [''],
      enableSubCategory: [false],
      subcategories: this.fb.array([]) // Each category has a FormArray of subcategories
    });
  }

  // Create a new subcategory form group
  createSubcategory(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
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
    this.getSubcategories(categoryIndex).push(this.createSubcategory());
  }

  // Remove a subcategory from a specific category
  removeSubcategory(categoryIndex: number, subcategoryIndex: number) {
    this.getSubcategories(categoryIndex).removeAt(subcategoryIndex);
  }

  // Go back to the previous page
  backToPrev() {
    this.location.back();
  }

  // Submit the form
  onSubmit() {
    if (this.addCategoriesForm.valid) {
      console.log('Submitted Data:', this.addCategoriesForm.value);
    }
  }
}
