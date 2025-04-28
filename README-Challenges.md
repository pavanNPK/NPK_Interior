## New Way

I have faced various challenges in **NPK Interior**. I needed to implement a `Form Array` things based on the category and subcategory for adding the products, which was a new experience for me. Furthermore, I needed to create a role-based access control system, which was also a challenge. Additionally, I had to learn how to use the **Nebular** library to create a user interface with a Material Design look and feel. I also had to learn how to use **MongoDB** and **Mongoose** to interact with the database. Lastly, I had to learn how to use **Express** to create a `server-side` API.

-----------------------------------------------------------------------------------
## Client-Side Challenges
### Client-Side Overview

On the client side of **NPK Interior**, we are leveraging the Angular framework to build a robust and interactive user interface. The key components and libraries used include:

- **Angular**: The backbone of our client-side application, providing a structured framework for building dynamic web applications.
- **Nebular & Bootstrap**: Utilized for styling and creating a consistent UI with a Material Design aesthetic.
- **PrimeNG**: Integrated for advanced UI components, enhancing user experience with features such as modals, tooltips, and more.
- **Reactive Forms**: Implemented for building complex forms, allowing us to manage form data and validation efficiently.
- **Angular Router**: Used to facilitate smooth navigation between different views and components.
- **State Management**: Techniques like services and observables are employed to manage application state and data flow between components.

Overall, the client-side is designed to provide a seamless and engaging shopping experience, with careful attention to UI/UX principles and performance optimization.

### 1. Products

> When building a form with multiple product entries, each product needs its own category and subcategory selection. The problem occurs when you have multiple products and select different categories for each one.
The issue is that when you select a category for any product, it was changing the subcategory options for all products instead of just for that specific product. This happens because all products were sharing the same list of subcategories.
The solution is to keep separate subcategory lists for each product. Instead of using one variable for all subcategories, we use a mapping system where each product form has its own dedicated subcategory list based on its position in the form array.

```aiignore
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
```
* **Creating form array for products (It's not a challenge but it's a good practice to have a form array for products)**
```aiignore
  get p(){
    return this.addProductsForm.get('products') as FormArray;
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
     // here we are creating a form group for each product
    });
  }
  
  removeProduct(i: number) {
    this.p.removeAt(i);
    // Clean up the subcategory map
    delete this.selectedSubCategoriesMap[i];
  }
  
```

Here we can use directly add the product. By using `addProduct` function, we can add a new product to the form array. The `removeProduct` function is used to remove a product from the form array and clean up the subcategory map.

> Adding custom validation to the form
```aiignore
dimensions: ['', [Validators.required, this.dimensionFormatValidator()]], // Example: "200x80x90 cm"
weight: ['', [Validators.required, this.weightFormatValidator()]], // Example: "40 KG"
warranty: ['', [Validators.required, this.warrantyFormatValidator()]], // Example: "2 Years"


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
``` 

-----------------------------------------------------------------------------------

#### Refer the formData in addProducts() function 

```aiignore
  addProducts() {
    const formData = this.addProductsForm.value.products;
    console.log('Form Data:', formData);
  }
  
  ...just sample code
  view enrtire code in add-products.component.ts
}

```

#### Here we are using some formulas to calculate the product discount and EMI details

```aiignore
    Perfect! Here's the EMI calculation as a table based on the following values:
    
    Original Price: ₹50,000
    Discount: 5%
    Discounted Price: ₹47500
    Annual Interest Rate: 12%
    Monthly Interest Rate: 1% (12 / 12 / 100 = 0.01)
    We’ll calculate EMI for 3, 6, 9, and 12 months using:
    
    EMI = (P x R x (1 + R)^N) / ((1 + R)^N - 1)
    
    Where:
    P = Discounted Price (47500)
    R = Monthly Interest Rate (0.01)
    N = Number of months (3, 6, 9, or 12)
    
    
    --------------------------------------------------------------
    
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
      const annualInterest = this.p.at(i).get('annualInterest')?.value || 12;
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

    annualInterestChange(event: any, i: number) {
      if (event.target.value > 16) {
        this.p.at(i).get('annualInterest')?.setValue(16);
      } else if (event.target.value < 0 || event.target.value === '') {
        this.p.at(i).get('annualInterest')?.setValue(0);
      }
      this.discountedPriceChange(this.p.at(i).get('price')?.value, this.p.at(i).get('discount')?.value, i);
    }
 ```

------------------------------------------------------------------------------------

### Reading excel and csv files. Convert them into required object post into DB

```aiignore
  import * as XLSX from "xlsx";
  //here i imported predefined excelFormatForBulkProducts for instruction to upload specific format
  import {ExcelFormatForBulkProducts} from "../excelFormatForBulkProducts";
  
   excelData: any[] = [];
   tableHeaders: string[] = [];
   
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
      this.excelData = [];
      this.tableHeaders = [];
      // Reset the file input so same file can be re-uploaded
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
    }
    formatForExcel(bulkPDCTExcelFormat: any) {
      this.dialogService.open(bulkPDCTExcelFormat, {closeOnBackdropClick: false});
    }
    uploadBulkProducts(){
      const getValue = (obj: any, key: string, fallback: any = 'changed') => {
        return Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : fallback;
      };
      const durations = [3, 6, 9, 12];
      const productImages = [1, 2, 3, 4, 5];

      const products = this.excelData.map((row: any) => ({
        name: getValue(row, 'name'),
        slug: getValue(row, 'slug'),
        description: getValue(row, 'description'),
        category: {
          name: getValue(row, 'category.name'),
          id: getValue(row, 'category.id')
        },
        subCategory: {
          name: getValue(row, 'subCategory.name'),
          id: getValue(row, 'subCategory.id')
        },
        price: getValue(row, 'price', 0),
        discount: getValue(row, 'discount', 0),
        discountedPrice: getValue(row, 'discountedPrice', 0),
        emiStartsAt: getValue(row, 'emiStartsAt', 0),
        annualInterest: getValue(row, 'annualInterest', 0),
        isTrending: getValue(row, 'isTrending', false),
        isFeatured: getValue(row, 'isFeatured', false),
        isNewArrival: getValue(row, 'isNewArrival', false),
        cart: getValue(row, 'cart', false),
        wishlist: getValue(row, 'wishlist', false),
        remainingCount: getValue(row, 'remainingCount', 0),
        specifications: {
          color: getValue(row, 'specifications.color'),
          brand: getValue(row, 'specifications.brand'),
          material: getValue(row, 'specifications.material'),
          weight: getValue(row, 'specifications.weight'),
          washingInstructions: getValue(row, 'specifications.washingInstructions'),
          dimensions: getValue(row, 'specifications.dimensions'),
          finish: getValue(row, 'specifications.finish'),
          warranty: getValue(row, 'specifications.warranty'),
        },
        emiDetails: durations.map(duration => {
          const prefix = `emiDetails${duration}`;
          return {
            month: getValue(row, `${prefix}.month`),
            monthlyEmi: getValue(row, `${prefix}.monthlyEmi`),
            totalPayable: getValue(row, `${prefix}.totalPayable`),
            interestAmount: getValue(row, `${prefix}.interestAmount`),
            principal: getValue(row, `${prefix}.principal`),
          };
        }),
        images: productImages
          .map(image => {
            const prefix = `images${image}`;
            const name = getValue(row, `${prefix}.name`);
            const key = getValue(row, `${prefix}.key`);
            const type = getValue(row, `${prefix}.type`);
            if (!name || !key || !type) return null;
            return {
              name,
              key,
              type,
            };
          })
          .filter(Boolean)
      }));

      this.ps.bulkUploadProducts(products).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.toastService.success('Successfully added new products', 'Products', {duration: 2000});
            this.closeUpload();
            this.router.navigate(['/products/view']);
          } else {
            this.toastService.danger('Failed to add new products', 'Products', {duration: 2000});
          }
        }
      })
    }
```

| Method                                                                                                                           | Explanation|
|----------------------------------------------------------------------------------------------------------------------------------|---|
 onFileSelected(event: Event)                                                                                                     | Purpose: Handles file selection event when the user selects a file.|
|                                                                                                                                  | Steps:|
|                                                                                                                                  | 1. Checks if a file is selected and if only one file is chosen.                                                                    
|                                                                                                                                  | 2. Reads the file using FileReader to parse an Excel file using the XLSX library.                                                  
|| 3. Extracts the sheet data and combines headers (from two rows) into a final header array.                                         
|| 4. Maps the rows into an object format, filtering out rows with empty values.                                                      
||5. Sets the processed data (excelData) and table headers (tableHeaders).                                                           
 closeUpload()                                                                                                                    | Purpose: Resets the upload state and clears the data.
|| Steps:                                                                                                                            
|| 1. Resets flags (nonUpload, submitted, bulkInstructions).                                                                         
||2. Clears previously uploaded data (excelData, tableHeaders).                                                                     
|| 3. Clears the file input field to allow the same file to be uploaded again.                                                      
 formatForExcel(bulkPDCTExcelFormat: any)                                                                                         | Purpose: Opens a dialog with instructions for bulk product upload.
|| Steps:                                                                                                                           
|| 1. Opens a dialog box with specific instructions (bulkPDCTExcelFormat).                                                          
 uploadBulkProducts()                                                                                                             | Purpose: Uploads the bulk product data after processing the Excel file.
| |Steps:                                                                                                                           
| |1. Defines a helper function getValue() to safely retrieve values from the row, defaulting to 'changed' if the key doesn’t exist. 
|| 2. Maps each row of excelData to a product object, extracting values from the row and converting them into the appropriate format. 
| |3. Uses the durations array to map EMI details for each product.                                                                 
|| 4. Loops over productImages to handle image-related data for the product.                                                        
| |5. Calls a bulkUploadProducts() method from a service (ps) to send the data to the backend.                                      
| |6. Displays a success or failure message using toastService and redirects to the products view page.                             