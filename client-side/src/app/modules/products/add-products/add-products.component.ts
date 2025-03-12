import {Component, OnInit} from '@angular/core';
import {
  NbButtonModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule, NbSelectModule,
  NbToastrService,
  NbTooltipModule
} from "@nebular/theme";
import {Location, NgForOf, NgIf} from "@angular/common";
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CategoriesService} from "../../../services/categories.service";
import {Router} from "@angular/router";
import {ResponseWithError} from "../../../models/commonDTO";
import {GetCatAndSubCatDTO, SubCategoriesDTO} from "../../../models/categoriesDTO";

@Component({
  selector: 'app-add-products',
  standalone: true,
  imports: [
    NbButtonModule,
    NbFormFieldModule,
    NbIconModule,
    NbTooltipModule,
    NgIf,
    ReactiveFormsModule,
    NgForOf,
    NbInputModule,
    NbSelectModule
  ],
  templateUrl: './add-products.component.html',
  styleUrl: './add-products.component.scss'
})
export class AddProductsComponent implements OnInit{
  addProductsForm!: FormGroup;
  loading: boolean = false;
  submitted: boolean = false;
  categoriesData: GetCatAndSubCatDTO[] = [];
  selectedSubCategories: SubCategoriesDTO[] = [];

  constructor(private location: Location,
              private fb: FormBuilder,
              private cs: CategoriesService,
              private router: Router,
              private toastService: NbToastrService,) {}

  get p(){
    return this.addProductsForm.get('products') as FormArray;
  }

  ngOnInit() {
    this.getCategories();
  }
  getCategories(){
    this.cs.getCatAndSubCat().subscribe({
      next: (response: ResponseWithError<GetCatAndSubCatDTO[]>) => {
        if (response.success)
          this.categoriesData = response.response || [];
        else
          this.categoriesData = [];
        this.loadForm();
      },
      error: (error) => console.error('Error fetching products', error),
      complete: () => (this.loading = true),
    })
    this.loadForm();
    this.loading=true;
  }
  loadForm() {
    this.addProductsForm = this.fb.group({
      products: this.fb.array([]) // Initialize the products as an empty Form array
    });
    // Add an initial category with a subcategory
    this.addProduct();
  }
  addProduct(){
    const product = this.createProduct();
    this.p.push(product);
  }
  createProduct(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      categoryId: ['', Validators.required],
      categoryName: ['', Validators.required],
      subCategoryId: ['', Validators.required],
      subCategoryName: ['', Validators.required],
      price: ['', Validators.required],
      discount: [0, Validators.required],
      stock: ['', Validators.required],
      image: [[], Validators.required],
      specifications: this.fb.group({
        material: ['', Validators.required],
        dimensions: ['', Validators.required], // Example: "200x80x90 cm"
        weight: ['', Validators.required], // Example: "40 KG"
        color: ['', Validators.required],
        finish: ['', Validators.required], // Matte, Glossy, etc.
        warranty: ['', Validators.required], // Example: "2 Years"
      }),
      additionalDetails: [''],
      isFeatured: [false],
      isTrending: [false],
      isNewArrival: [false],
    })
  }
  backToPrev() {
    this.location.back();
  }

  addProducts() {

  }

  selectCategory(data: any) {
    this.selectedSubCategories = data.subCategories;
    console.log(this.addProductsForm.value)
  }
}
