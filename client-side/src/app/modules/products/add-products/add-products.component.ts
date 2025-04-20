  import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
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
  import {ProductsService} from "../../../services/products.service";
  import * as XLSX from "xlsx";
  import {ProductsDTO} from "../../../models/productsDTO";

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
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
    addProductsForm!: FormGroup;
    loading: boolean = false;
    bulkInstructions: boolean = false;
    nonUpload: boolean = false;
    submitted: boolean = false;
    categoriesData: GetCatAndSubCatDTO[] = [];
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
    excelData: any[] = [];
    tableHeaders: string[] = [];

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
        name: ['', [Validators.required, this.productNameValidation()]],
        description: ['', [Validators.required,
          Validators.pattern('^(?<!\\s)\\S(.*\\S)?$'),
          Validators.minLength(20),
          Validators.maxLength(150)]],
        price: ['', Validators.required],
        discount: ['5', [Validators.required, Validators.min(0), Validators.max(99)]],
        discountedPrice: [0, [Validators.required]],
        emiStartsAt: [0, [Validators.required]],
        anualInterest: [12, [Validators.required, Validators.min(0), Validators.max(16)]],
        images: [[], [Validators.required]],
        emiDetails: [[], [Validators.required]],
        category: this.fb.group({
          id: ['', Validators.required],
          name: ['', Validators.required],
        }),
        subCategory: this.fb.group({
          id: ['', Validators.required],
          name: ['', Validators.required],
        }),
        specifications: this.fb.group({
          brand: ['', [Validators.required, Validators.pattern('^[^\\s][\\w\\W\\s]*$')]],
          washingInstructions: [''],
          material: ['', [Validators.required, Validators.pattern('^[^\\s][\\w\\W\\s]*$')]],
          dimensions: ['', [Validators.required, this.dimensionFormatValidator()]], // Example: "200x80x90 cm"
          weight: ['', [Validators.required, this.weightFormatValidator()]], // Example: "40 KG"
          color: ['', [Validators.required, Validators.pattern('^[^\\s][\\w\\W\\s]*$')]],
          finish: ['', [Validators.required, Validators.pattern('^[^\\s][\\w\\W\\s]*$')]], // Matte, Glossy, etc.
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
    productNameValidation():  ValidatorFn {
      return (control: AbstractControl): ValidationErrors | null => {
        const pattern = /^[^\s]([^\s]|(\s[^\s]))*$/; // Allow only alphanumeric characters and spaces
        return control.value && !pattern.test(control.value) ? { invalidName: true } : null;
      };
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
    discountChange(event: any, i: number) {
      if (event.target.value > 99) {
        this.p.at(i).get('discount')?.setValue(99);
      }
      this.discountedPriceChange(this.p.at(i).get('price')?.value, this.p.at(i).get('discount')?.value, i);
    }
    priceChange(event: any, i: number) {
      this.discountedPriceChange(event.target.value, this.p.at(i).get('discount')?.value, i);
    }
    discountedPriceChange(price: number, discount: number, i: any) {
      // Step 1: Calculate Discounted Price
      const discountedPrice = price - (price * discount / 100);
      this.p.at(i).get('discountedPrice')?.setValue(discountedPrice);

      // Step 2: Get Annual Interest (from form)
      const annualInterest = this.p.at(i).get('anualInterest')?.value || 12;
      const monthlyRate = annualInterest / 12 / 100;

      // Step 3: EMI Formula Function
      const calculateEMI = (P: number, R: number, N: number): number => {
        const numerator = P * R * Math.pow(1 + R, N);
        const denominator = Math.pow(1 + R, N) - 1;
        return Math.round(numerator / denominator);
      };

      // Step 4: Calculate EMI for 3 months (default)
      const emi3 = calculateEMI(discountedPrice, monthlyRate, 3);
      this.p.at(i).get('emiStartsAt')?.setValue(emi3);

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
      this.p.at(i).get('emiDetails')?.setValue(emiDetails);
    }

    anualInterestChange(event: any, i: number) {
      if (event.target.value > 16) {
        this.p.at(i).get('anualInterest')?.setValue(16);
      } else if (event.target.value < 0 || event.target.value === '') {
        this.p.at(i).get('anualInterest')?.setValue(0);
      }
      this.discountedPriceChange(this.p.at(i).get('price')?.value, this.p.at(i).get('discount')?.value, i);
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
      this.selectedSubCategoriesMap[i] = data.subCategories;
    }

    removeProduct(i: number) {
      this.p.removeAt(i);
      // Clean up the subcategory map
      delete this.selectedSubCategoriesMap[i];
    }

    onFileSelect(event: any, i: number) {
      let filesMap = event.currentFiles.map((file: any) => {
        return file
      });
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

    onFileSelected(event: Event) {
      this.nonUpload = true;
      this.bulkInstructions = true;
      const target = event.target as HTMLInputElement;

      if (!target.files || target.files.length !== 1) {
        console.error('Please select exactly one file.');
        return;
      }

      const file = target.files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const bstr = e.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        const sheet = XLSX.utils.sheet_to_json(ws, { header: 1 });

        // Handle headers (first 2 rows)
        const headerRow1 = sheet[0];
        const headerRow2 = sheet[1];

        // @ts-ignore
        const finalHeaders = headerRow1.map((col: any, i: string | number) => {
          // @ts-ignore
          if (headerRow2 && headerRow2[i]) {
            // @ts-ignore
            return `${col}.${headerRow2[i]}`.trim();
          }
          return col;
        });

        const dataRows = sheet.slice(2);
        this.excelData = dataRows
          .map(row => {
            const obj: any = {};
            finalHeaders.forEach((key: string | number, i: string | number) => {
              // @ts-ignore
              obj[key] = row[i];
            });
            return obj;
          })
          .filter(row =>
            Object.values(row).some(value => value !== null && value !== undefined && value !== '')
          );

        this.tableHeaders = finalHeaders;
      };

      reader.readAsBinaryString(file);
    }

    closeUpload(){
      this.nonUpload = false;
      this.submitted = false;
      this.bulkInstructions = false;
      this.p.reset();
      this.excelData = [];
      this.tableHeaders = [];
      // Reset the file input so same file can be re-uploaded
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
    }
    uploadBulkProducts(){
      console.log(this.excelData);
      console.log(this.tableHeaders);
      const products = this.excelData.map((row: any) => {
        console.log(row)
        return {
          name: row[this.tableHeaders[0]],
          slug: row[this.tableHeaders[1]],
          description: row[this.tableHeaders[2]],
          category: {
            name: row[this.tableHeaders[3]],
            id: row[this.tableHeaders[4]]
          },
          subCategory: {
            name: row[this.tableHeaders[5]],
            id: row[this.tableHeaders[6]]
          },
          price: row[this.tableHeaders[7]],
          discount: row[this.tableHeaders[8]],
          discountedPrice: row[this.tableHeaders[9]],
          emiStartAt: row[this.tableHeaders[10]],
          annualInterest: row[this.tableHeaders[11]],
          isTrending: row[this.tableHeaders[12]],
          isFeatured: row[this.tableHeaders[13]],
          isNewArrival: row[this.tableHeaders[14]],
        };
      })

      console.log(products)

    }
    addProducts() {
      this.submitted = true;
      if (this.p.controls.some((c, i) => this.getImageCount(i) > 5)) return;
      if (this.addProductsForm.invalid) return;
      const duplicateNames = this.addProductsForm.value.products.map((p: { name: string; }) => p.name);
      const duplicates = duplicateNames.filter((name: string, index: number) => duplicateNames.indexOf(name) !== index);
      if (duplicates.length > 0) {
        console.error(`${duplicates.length} duplicate product name(s) found: ${duplicates.join(', ')}`);
        return;
      }
      const formData = new FormData();
      this.addProductsForm.value.products.forEach((product: any, index: number) => {
        formData.append(`products[${index}][name]`, product.name);
        formData.append(`products[${index}][description]`, product.description);
        formData.append(`products[${index}][category]`, JSON.stringify(product.category));
        formData.append(`products[${index}][subCategory]`, JSON.stringify(product.subCategory));
        formData.append(`products[${index}][price]`, product.price);
        formData.append(`products[${index}][discount]`, product.discount);
        formData.append(`products[${index}][discountedPrice]`, product.discountedPrice);
        formData.append(`products[${index}][emiStartsAt]`, product.emiStartsAt);
        formData.append(`products[${index}][anualInterest]`, product.anualInterest);
        formData.append(`products[${index}][specifications]`, JSON.stringify(product.specifications));
        formData.append(`products[${index}][isFeatured]`, product.isFeatured);
        formData.append(`products[${index}][isTrending]`, product.isTrending);
        formData.append(`products[${index}][isNewArrival]`, product.isNewArrival);
        formData.append(`products[${index}][emiDetails]`, JSON.stringify(product.emiDetails));

        // Ensure that images are appended correctly
        // Append images as File objects instead of JSON
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
          product.images.forEach((file: File, fileIndex: number) => {
            // Use product index to associate images with specific products
            formData.append(`images-${index}`, file);
          });
        }
      });

      this.ps.addProducts(formData).subscribe({
        next: (response: any) => {
          if (response.role !== 'notAllowed') {
            if (response.success) {
              this.submitted = false;
              this.addProductsForm.reset();
              this.p.reset();
              this.uploadedFiles = [];
              this.router.navigate(['/products/view']);
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
