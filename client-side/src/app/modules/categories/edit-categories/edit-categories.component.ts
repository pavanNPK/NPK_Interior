import {Component, OnInit} from '@angular/core';
import {Location, NgClass, NgForOf} from "@angular/common";
import {NbButtonModule, NbIconModule, NbInputModule, NbTooltipModule} from "@nebular/theme";
import {NgIf} from "@angular/common";
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CategoriesService} from "../../../services/categories.service";
import {ActivatedRoute} from "@angular/router";
import {CategoriesDTO} from "../../../models/categoriesDTO";
import {ResponseWithError} from "../../../models/commonDTO";
import {DividerModule} from "primeng/divider";

@Component({
  selector: 'app-edit-categories',
  standalone: true,
  imports: [
    NbButtonModule,
    NbIconModule,
    NbTooltipModule,
    NgIf,
    ReactiveFormsModule,
    NbInputModule,
    DividerModule,
    NgForOf,
    NgClass,
  ],
  templateUrl: './edit-categories.component.html',
  styleUrl: './edit-categories.component.scss'
})
export class EditCategoriesComponent implements OnInit{
  loading: boolean = false;
  submitted: boolean = false;
  editCategoriesForm?: FormGroup | any;
  categoryData?: CategoriesDTO;
  catId: string = '';
  constructor(private location: Location, private cs: CategoriesService, private route: ActivatedRoute, private fb: FormBuilder) {
  }
  get c() {
    return this.editCategoriesForm?.controls;
  }

  get sc() {
    return this.editCategoriesForm?.get('subCategories') as FormArray;
  }

  ngOnInit() {
    this.route.queryParams.subscribe(x => {
     this.catId = x['cId']; // Use get() instead of accessing directly (optional) this.catId = x.get('cId');
     this.getCategory(this.catId);
    });
  }
  getCategory(id: string){
    this.cs.getCategoryById(id).subscribe({
      next: (response: ResponseWithError<CategoriesDTO>) => {
        if (response.success)
          this.categoryData = response.response || {};
        else
          this.categoryData = {};
        this.loadForm(this.categoryData);
        this.loading = true;
      },
      error: (error) => console.error('Error fetching products', error),
      complete: () => (this.loading = true),
    })
  }
  loadForm(data: any) {
    this.editCategoriesForm = this.fb.group({
      _id: [data._id || ''],
      name: [data.name || '', Validators.required],
      description: [data.description || ''],
      subCategories: this.fb.array([]) // Initialize an empty FormArray first
    });

    if (data.subCategories.length) {
      data.subCategories.forEach((sub: any) => {
        this.sc.push(this.loopCategories(sub));
      });
    } else {
      // If no subcategories, add a single empty form group
      this.sc.push(this.loopCategories({}));
    }
  }


  backToPrev() {
    this.location.back();
  }

  loopCategories(subCategories: any) {
    return this.fb.group({
      name: [subCategories.name || '', Validators.required],
      description: [subCategories.description || ''],
      category_id: [subCategories.category_id || this.catId],
      _id: [subCategories._id || '']
    })
  }

  removeSubCategory(i: number) {
    (this.editCategoriesForm.get('subCategories') as FormArray).removeAt(i);
  }

  updateCategories() {
    this.submitted = true;
    if(this.editCategoriesForm.invalid){
      return
    } else {

    }
  }
  trimLeadingSpace(event: any) {
    const input = event.target;
    // Remove leading spaces only (but allow spaces between words)
    input.value = input.value.replace(/^\s+/, '');
    // Allow only alphabetic characters and spaces after a character has been entered
    input.value = input.value.replace(/[^a-zA-Z ]/g, '');
    input.dispatchEvent(new Event('input')); // Updates the form control
  }

  addSubCategory() {
    this.sc.push(this.loopCategories({})); // Pass an empty object instead of an empty string
  }
}
