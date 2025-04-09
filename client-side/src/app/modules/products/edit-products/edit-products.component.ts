import {Component, OnInit} from '@angular/core';
import {GetCatAndSubCatDTO, SubCategoriesDTO} from "../../../models/categoriesDTO";
import {
  AbstractControl,
  FormBuilder,
  FormGroup, ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {Location, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {CategoriesService} from "../../../services/categories.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ProductsService} from "../../../services/products.service";
import {
  NbButtonModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule, NbOptionModule, NbSelectModule,
  NbToastrService,
  NbTooltipModule
} from "@nebular/theme";
import {ResponseWithError} from "../../../models/commonDTO";
import {PaginatorModule} from "primeng/paginator";
import {ProductsDTO} from "../../../models/productsDTO";
import {forkJoin} from "rxjs";
import {ToggleButtonModule} from "primeng/togglebutton";
import {FileUploadModule} from "primeng/fileupload";

@Component({
  selector: 'app-edit-products',
  standalone: true,
  imports: [
    NbButtonModule,
    NbIconModule,
    NbTooltipModule,
    NgIf,
    PaginatorModule,
    ReactiveFormsModule,
    NbFormFieldModule,
    NbInputModule,
    NbOptionModule,
    NbSelectModule,
    NgForOf,
    ToggleButtonModule,
    FileUploadModule,
    NgOptimizedImage
  ],
  templateUrl: './edit-products.component.html',
  styleUrl: './edit-products.component.scss'
})
export class EditProductsComponent implements OnInit{
  editProductsForm!: FormGroup | any;
  loading: boolean = false;
  submitted: boolean = false;
  categoriesData: GetCatAndSubCatDTO[] = [];
  uploadedFiles: any[] = [];
  loadedFiles: any[] = [];
  removedFiles: any[] = [];
  commonFiles: any[] = [];
  selectedSubCategories: SubCategoriesDTO[] = [];
  product?: ProductsDTO | any = {};
  slug: string = '';
  constructor(private location: Location,
              private fb: FormBuilder,
              private cs: CategoriesService,
              private router: Router,
              private route: ActivatedRoute,
              private ps: ProductsService,
              private toastService: NbToastrService,) {}
  get p(){
    return this.editProductsForm?.controls;
  }
  // Add this to your component class
  get specificationControls() {
    return (this.editProductsForm.get('specifications') as FormGroup).controls;
  }
  ngOnInit() {
    this.route.queryParams.subscribe(x => {
      this.slug = x['product'];
    })
    this.getCategoriesAndProduct()
  }
  getCategoriesAndProduct(){
    forkJoin(this.cs.getCatAndSubCat(), this.ps.getProductById(this.slug)).subscribe({
      next: (response: [ResponseWithError<GetCatAndSubCatDTO[]>, ResponseWithError<ProductsDTO>]) => {
        if (response[0].success && response[1].success)
          this.categoriesData = response[0].response || [];
        else
          this.categoriesData = [];
        if (response[1].role !== 'notAllowed')
        {
          if (response[1].success)
            this.product = response[1].response || {};
          else
            this.product = {};
        }
      },
      error: (error) => console.error('Error fetching products', error),
      complete: () => {
        this.loadForm();
        let categoryData = this.categoriesData.find(x =>  x._id === this.product.category.id);
        this.selectCategory(categoryData, 'load');
        this.loadedFiles = this.product.images;
        this.loading = true;
      },
    })
  }
  backToPrev() {
    this.location.back();
  }
  loadForm() {
    this.editProductsForm = this.fb.group({
      name: [this.product.name || '', [Validators.required, Validators.pattern('^[^\\s][\\w\\W\\s]*$')]],
      description: [this.product.description || '', [Validators.required,
        Validators.pattern('^(?<!\\s)\\S(.*\\S)?$'),
        Validators.minLength(20),
        Validators.maxLength(150)]],
      price: [this.product.price || '', Validators.required],
      discount: [this.product.discount || '5', [Validators.required, Validators.min(0), Validators.max(99)]],
      discountedPrice: [this.product.discountedPrice || 0, [Validators.required]],
      emiStartsAt: [this.product.emiStartsAt || 0, [Validators.required]],
      anualInterest: [this.product.anualInterest || 12, [Validators.required, Validators.min(0), Validators.max(16)]],
      images: [[]],
      emiDetails: [this.product.emiDetails || [], [Validators.required]],
      category: this.fb.group({
        id: [this.product.category?.id || '', Validators.required],
        name: [this.product.category?.name || '', Validators.required],
      }),
      subCategory: this.fb.group({
        id: [this.product.subCategory?.id || '', Validators.required],
        name: [this.product.subCategory?.name || '', Validators.required],
      }),
      specifications: this.fb.group({
        brand: [this.product.specifications?.brand || 'NPK', [Validators.required, Validators.pattern('^[^\\s][\\w\\W\\s]*$')]],
        washingInstructions: [this.product.specifications?.washingInstructions || ''],
        material: [this.product.specifications?.material || '', [Validators.required, Validators.pattern('^[^\\s][\\w\\W\\s]*$')]],
        dimensions: [this.product.specifications?.dimensions || '', [Validators.required, this.dimensionFormatValidator()]], // Example: "200x80x90 cm"
        weight: [this.product.specifications?.weight || '', [Validators.required, this.weightFormatValidator()]], // Example: "40 KG"
        color: [this.product.specifications?.color || '', [Validators.required, Validators.pattern('^[^\\s][\\w\\W\\s]*$')]],
        finish: [this.product.specifications?.finish || '', [Validators.required, Validators.pattern('^[^\\s][\\w\\W\\s]*$')]], // Matte, Glossy, etc.
        warranty: [this.product.specifications?.warranty || '', [Validators.required, this.warrantyFormatValidator()]], // Example: "2 Years"
      }),
      additionalDetails: [''],
      isFeatured: [this.product.isFeatured || false],
      isTrending: [this.product.isTrending || false],
      isNewArrival: [this.product.isNewArrival || false],
    });
  }

  onDimensionInput(event: any) {
    let value = event.target.value;
    value = value.replace(/\*/g, 'x'); // Replace * with x
    this.editProductsForm.get('specifications.dimensions')?.setValue(value, { emitEvent: false });
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
  selectCategory(data: any, type: string) {
    this.editProductsForm.get('category')?.get('name')?.setValue(data.name);
    this.editProductsForm.get('subCategory')?.reset(type === 'load' ? { name: this.product.subCategory?.name, id: this.product.subCategory?.id } : { name: '', id: '' });
    this.selectedSubCategories = data.subCategories;
  }
  discountChange(event: any) {
    if (event.target.value > 99) {
      this.editProductsForm.get('discount')?.setValue(99);
    }
    this.discountedPriceChange(this.editProductsForm.get('price')?.value, this.editProductsForm.get('discount')?.value);
  }
  priceChange(event: any) {
    this.discountedPriceChange(event.target.value, this.editProductsForm.get('discount')?.value);
  }
  discountedPriceChange(price: number, discount: number) {
    // Step 1: Calculate Discounted Price
    const discountedPrice = price - (price * discount / 100);
    this.editProductsForm.get('discountedPrice')?.setValue(discountedPrice);

    // Step 2: Get Annual Interest (from form)
    const annualInterest = this.editProductsForm.get('anualInterest')?.value || 12;
    const monthlyRate = annualInterest / 12 / 100;

    // Step 3: EMI Formula Function
    const calculateEMI = (P: number, R: number, N: number): number => {
      const numerator = P * R * Math.pow(1 + R, N);
      const denominator = Math.pow(1 + R, N) - 1;
      return Math.round(numerator / denominator);
    };

    // Step 4: Calculate EMI for 3 months (default)
    const emi3 = calculateEMI(discountedPrice, monthlyRate, 3);
    this.editProductsForm.get('emiStartsAt')?.setValue(emi3);

    // Optional: calculate and store all EMI values if needed
    const emiDetails: {
      month: number;
      monthlyEmi: number;
      totalPayable: number;
      interestAmount: number;
      principal: number;
    }[] = [];

    [3, 6, 9, 12].forEach(month => {
      const monthlyEmi = calculateEMI(discountedPrice, monthlyRate, month);
      const totalPayable = monthlyEmi * month;
      const interestAmount = totalPayable - discountedPrice;

      emiDetails.push({
        month,
        monthlyEmi,
        totalPayable,
        interestAmount: Math.round(interestAmount),
        principal: discountedPrice
      });
    });
    console.log('EMI Options:', emiDetails); // or use them in a UI popup
    this.editProductsForm.get('emiDetails')?.setValue(emiDetails);
  }
  anualInterestChange(event: any) {
    if (event.target.value > 16) {
      this.editProductsForm.get('anualInterest')?.setValue(16);
    } else if (event.target.value < 0 || event.target.value === '') {
      this.editProductsForm.get('anualInterest')?.setValue(0);
    }
    this.discountedPriceChange(this.editProductsForm.get('price')?.value, this.editProductsForm.get('discount')?.value);
  }
  onFileSelect(event: any) {
    let filesMap = event.currentFiles.filter((file: any) => {
      return file
    });
    console.log(filesMap);
    this.editProductsForm.get('images')?.setValue(filesMap);
    this.getImageCount()
  }
  getImageCount(): number {
    const images = this.editProductsForm.get('images')?.value;
    this.commonFiles = images.filter((x: { name: any; }) => this.loadedFiles.some(y => x.name === y.name)).map((x: { name: any; }) => x.name);
    return Array.isArray(images) ? images.length : 0;
  }
  removeFile(event: any) {
    const fileToRemove = event.file;
    const currentImages = this.editProductsForm.get('images')?.value || [];
    const updatedImages = currentImages.filter((file: any) => file.name !== fileToRemove.name);
    this.editProductsForm.get('images')?.setValue(updatedImages);
  }
  removeLoadedFile(image: any, i: number) {
    this.removedFiles.push(image);
    this.loadedFiles.splice(i, 1);
    if (!this.loadedFiles.length){
      this.editProductsForm.get('images')?.setValidators([Validators.required]);
      this.editProductsForm.get('images')?.updateValueAndValidity();
    }
  }
  editProduct(){
    this.submitted = true;
    if (this.editProductsForm.invalid || this.commonFiles.length) {
      return;
    }
    const formData = new FormData();
    formData.append('name', this.editProductsForm.get('name')?.value);
    formData.append('description', this.editProductsForm.get('description')?.value);
    formData.append('category', JSON.stringify(this.editProductsForm.get('category')?.value));
    formData.append('subCategory', JSON.stringify(this.editProductsForm.get('subCategory')?.value));
    formData.append('price', this.editProductsForm.get('price')?.value);
    formData.append('discount', this.editProductsForm.get('discount')?.value);
    formData.append('discountedPrice', this.editProductsForm.get('discountedPrice')?.value);
    formData.append('emiStartsAt', this.editProductsForm.get('emiStartsAt')?.value);
    formData.append('anualInterest', this.editProductsForm.get('anualInterest')?.value);
    formData.append('specifications', JSON.stringify(this.editProductsForm.get('specifications')?.value));
    formData.append('isFeatured', this.editProductsForm.get('isFeatured')?.value);
    formData.append('isTrending', this.editProductsForm.get('isTrending')?.value);
    formData.append('isNewArrival', this.editProductsForm.get('isNewArrival')?.value);
    let imageFiles = this.editProductsForm.get('images')?.value;
    // Append image files
    for (let i = 0; i < imageFiles.length; i++) {
      formData.append('images', imageFiles[i]); // Don't stringify, send it as a File object
    }
    formData.append(`emiDetails`, JSON.stringify(this.editProductsForm.get('emiDetails')?.value));
    if (this.loadedFiles.length){
      formData.append('loadedImages', JSON.stringify(this.loadedFiles));
    }
    if (this.removedFiles.length){
      formData.append('removedImages', JSON.stringify(this.removedFiles));
    }
    // @ts-ignore
    for (const value of formData.values()) {
      console.log(value);
    }

    this.ps.updateProduct(this.slug, formData).subscribe({
      next: (response) => {
        if (response.role !== 'notAllowed') {
          if (response.success) {
            this.submitted = false;
            this.editProductsForm.reset();
            this.p.reset();
            this.removedFiles = this.loadedFiles = this.uploadedFiles = [];
            this.router.navigate(['/products/view']);
            this.toastService.success('Successfully updated the product', this.product.name, {duration: 2000});
          } else {
            this.toastService.danger('Failed to update the product', this.product.name, {duration: 2000});
          }
          this.loading = false;
        } else {
          this.toastService.danger(`You don't have permission to update.`,  this.product.name, {duration: 2000});
        }
      },
      error: (error) => {
        console.error(error);
      }
    })
  }
}
