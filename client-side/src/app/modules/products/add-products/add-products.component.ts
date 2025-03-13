import {Component, OnInit} from '@angular/core';
import {
  NbButtonModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule, NbSelectModule,
  NbToastrService,
  NbTooltipModule
} from "@nebular/theme";
import {Location, NgClass, NgForOf, NgIf} from "@angular/common";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule, ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {CategoriesService} from "../../../services/categories.service";
import {Router} from "@angular/router";
import {ResponseWithError} from "../../../models/commonDTO";
import {GetCatAndSubCatDTO, SubCategoriesDTO} from "../../../models/categoriesDTO";
import {ToggleButtonModule} from "primeng/togglebutton";
import {FileUploadModule} from "primeng/fileupload";

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
    NbSelectModule,
    NgClass,
    ToggleButtonModule,
    FileUploadModule
  ],
  templateUrl: './add-products.component.html',
  styleUrl: './add-products.component.scss'
})

export class AddProductsComponent implements OnInit{
  addProductsForm!: FormGroup;
  loading: boolean = false;
  submitted: boolean = false;
  categoriesData: GetCatAndSubCatDTO[] = [];
  stockOptions = [
    { label: 'In Stock', value: 'in_stock' },
    { label: 'Low Stock', value: 'low_stock' },
    { label: 'Out of Stock', value: 'out_of_stock' },
    { label: 'Pre-Order', value: 'pre_order' },
    { label: 'Backorder', value: 'backorder' },
  ];
  uploadedFiles: any[] = [];
  /**
   * This is a map where the key is the index of the product in the products FormArray,
   * and the value is an array of subcategories for that product.
   * This is used to store the selected subcategories for each product
   * so that we can access them later in the template.
   * selectedSubCategories: SubCategoriesDTO[] = [];
   * if we use this one,then we can't access them as separately.
   * After accessing them in template, So we use the below one.
   */
  selectedSubCategoriesMap: {[index: number]: SubCategoriesDTO[]} = {};

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
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(150)]],
      categoryId: ['', Validators.required],
      categoryName: ['', Validators.required],
      subCategoryId: ['', Validators.required],
      subCategoryName: ['', Validators.required],
      price: ['', Validators.required],
      discount: [0, Validators.required],
      stock: ['', Validators.required],
      image: [[], Validators.required],
      specifications: this.fb.group({
        material: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
        dimensions: ['', [Validators.required, this.dimensionFormatValidator()]], // Example: "200x80x90 cm"
        weight: ['', [Validators.required, this.weightFormatValidator()]], // Example: "40 KG"
        color: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
        finish: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]], // Matte, Glossy, etc.
        warranty: ['', [Validators.required, this.warrantyFormatValidator()]], // Example: "2 Years"
      }),
      additionalDetails: [''],
      isFeatured: [false],
      isTrending: [false],
      isNewArrival: [false],
    })
  }
  onDimensionInput(event: any, i: any) {
    let value = event.target.value;
    value = value.replace(/\*/g, 'x'); // Replace * with x
    this.p.at(i).get('specifications.dimensions')?.setValue(value, { emitEvent: false });
  }
  dimensionFormatValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const pattern = /^\d+x\d+x\d+\s(cm|mm|in)$/; // Example: "200x80x90 cm"
      return control.value && !pattern.test(control.value) ? { invalidFormat: true } : null;
    };
  }
  weightFormatValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const pattern = /^\d+\s(kg|g|lb|oz)$/i; // Allows "40 KG", "10 lb", "5 g", etc.
      return control.value && !pattern.test(control.value) ? { invalidWeightFormat: true } : null;
    };
  }
  warrantyFormatValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const pattern = /^(6|12|18|24|30|36)\s(Months?)$/i; // Allows "6 Months", "36 Months", etc.
      // const pattern = /^(6|1[0-9]|2[0-4])\s(Months?)$/i; // Allows "6 Months", "12 Months", etc.
      return control.value && !pattern.test(control.value) ? { invalidWarrantyFormat: true } : null;
    };
  }
  backToPrev() {
    this.location.back();
  }

  selectCategory(data: any, i: number) {
    const product = this.p.at(i);
    if (product) {
      product.get('categoryName')?.setValue(data.name);
      product.get('subCategoryName')?.setValue('');
      product.get('subCategoryId')?.setValue('');
    }
    // this.selectedSubCategories = data.subCategories;
    this.selectedSubCategoriesMap[i] = data.subCategories;
    console.log(this.addProductsForm.value)
  }

  removeProduct(i: number) {
    this.p.removeAt(i);
    // Clean up the subcategory map
    delete this.selectedSubCategoriesMap[i];
  }
  // In your component.ts file
  onUpload(event: any, index: number) {
    console.log('npk upload')
    // Store the files in your uploadedFiles array
    if (!this.uploadedFiles) {
      this.uploadedFiles = [];
    }

    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }

    console.log(this.uploadedFiles)

    // Update the form control value
    this.p.at(index).get('image')?.setValue(this.uploadedFiles);
  }
  addProducts() {
    this.submitted = true;
    if (this.addProductsForm.invalid){
      return
    } else {
      console.log(this.addProductsForm.value)
    }
  }

  onFileSelect(event: any, i: number) {
    this.p.at(i).get('image')?.setValue(event.currentFiles);
    console.log(this.p.at(i).get('image')?.value)
  }

  removeFile(event: any, i: number) {
    const fileToRemove = event.file;
    const currentImages = this.p.at(i).get('image')?.value || [];
    const updatedImages = currentImages.filter((file: any) => file.name !== fileToRemove.name);
    this.p.at(i).get('image')?.setValue(updatedImages);
    console.log(updatedImages);
  }

  protected readonly length = length;
}
