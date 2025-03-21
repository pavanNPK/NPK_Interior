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
  import {ProductsDTO} from "../../../models/productsDTO";
  import {ProductsService} from "../../../services/products.service";

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
                private ps: ProductsService,
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
        name: ['fsdf', [Validators.required, Validators.pattern('^(?:[a-zA-Z]+(?:\\s+[a-zA-Z]+)*)$')]],
        description: ['sdfnksnf sdfsbfsjdf bskjf sgsdkjg sgj sdgs dgksg', [Validators.required, Validators.minLength(20), Validators.maxLength(150)]],
        price: ['3434', Validators.required],
        discount: [40, [Validators.required]],
        stock: ['in_stock', [Validators.required]],
        images: [[], [Validators.required]],
        category: this.fb.group({
          id: ['', Validators.required],
          name: ['', Validators.required],
        }),
        subCategory: this.fb.group({
          id: ['', Validators.required],
          name: ['', Validators.required],
        }),
        specifications: this.fb.group({
          material: ['nknxdk', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
          dimensions: ['30*40*50 cm', [Validators.required, this.dimensionFormatValidator()]], // Example: "200x80x90 cm"
          weight: ['40 kg', [Validators.required, this.weightFormatValidator()]], // Example: "40 KG"
          color: ['fsdk', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
          finish: ['sadf', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]], // Matte, Glossy, etc.
          warranty: ['6 months', [Validators.required, this.warrantyFormatValidator()]], // Example: "2 Years"
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
        product.get('category')?.get('name')?.setValue(data.name);
        product.get('subCategory')?.get('name')?.setValue('');
        product.get('subCategory')?.get('id')?.setValue('');
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

    onFileSelect(event: any, i: number) {
      console.log(event.currentFiles)
      let filesMap = event.currentFiles.map((file: any) => {
        return {
          lastModified: file.lastModified,
          lastModifiedDate: file.lastModifiedDate,
          name: file.name,
          size: file.size,
          type: file.type,
          webkitRelativePath: file.webkitRelativePath
        };
      });
      console.log(filesMap, 'filesMap')
      this.p.at(i).get('images')?.setValue(filesMap);
      this.getImageCount(i)
    }
    getImageCount(index: number): number {
      const images = this.p.at(index).get('images')?.value;
      return Array.isArray(images) ? images.length : 0;
    }

    removeFile(event: any, i: number) {
      const fileToRemove = event.file;
      const currentImages = this.p.at(i).get('images')?.value || [];
      const updatedImages = currentImages.filter((file: any) => file.name !== fileToRemove.name);
      this.p.at(i).get('images')?.setValue(updatedImages);
    }

    addProducts() {
      console.log(this.addProductsForm.value)
      this.submitted = true;
      if (this.p.controls.some((c, i) => this.getImageCount(i) > 5)) return;
      if (this.addProductsForm.invalid) return;
      const duplicateNames = this.addProductsForm.value.products.map((p: { name: string; }) => p.name);
      console.log(duplicateNames, 'duplicateNames')
      const duplicates = duplicateNames.filter((name: string, index: number) => duplicateNames.indexOf(name) !== index);
      console.log(duplicates, 'duplicates')
      if (duplicates.length > 0) {
        console.error(`${duplicates.length} duplicate product name(s) found: ${duplicates.join(', ')}`);
        return;
      }
      let products: ProductsDTO[] = [];
      let formData = new FormData();
      this.addProductsForm.value.products.forEach((product: any) => {
        console.log(product, 'product')
        const data = new ProductsDTO();
        data.name = product.name;
        data.description = product.description;
        data.category = product.category;
        data.subCategory = product.subCategory;
        data.price = product.price;
        data.discount = product.discount;
        data.stock = product.stock;
        data.images = product.images;
        data.specifications = product.specifications;
        data.isFeatured = product.isFeatured;
        data.isTrending = product.isTrending;
        data.isNewArrival = product.isNewArrival;
        products.push(data);
      })
      console.log(products);
      this.ps.addProducts(products).subscribe({
        next: (response: any) => {
          console.log(response, 'response');
          if (response.role !== 'notAllowed') {
            if (response.success) {
              this.submitted = false;
              this.addProductsForm.reset();
              this.p.reset();
              this.uploadedFiles = [];
              this.addProductsForm.markAsPristine();
              this.addProductsForm.markAsUntouched();
              this.addProductsForm.updateValueAndValidity();
              this.toastService.success('Successfully added new products', 'Products', {duration: 2000});
            } else {
              this.toastService.danger('Failed to add new products', 'Products', {duration: 2000});
            }
            this.loading = false;
          } else {
            this.toastService.danger(`You don't have permission to create.`,  'Add Product', {duration: 2000});
          }
        },
        error: (err: any) => {
          this.toastService.danger({ severity: 'error', summary: 'Error', detail: err.message });
        }
      })
    }
  }
