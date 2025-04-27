import {Component, computed, OnInit} from '@angular/core';
import {
  NbButtonModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule, NbSelectModule, NbToastrService,
  NbTooltipModule
} from "@nebular/theme";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {Location} from "@angular/common";
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {LocationsService} from "../../../services/locations.service";
import {NgbTypeahead} from "@ng-bootstrap/ng-bootstrap";
import {debounceTime, distinctUntilChanged, map, Observable, OperatorFunction} from "rxjs";
import {LocationsDTO} from "../../../models/locationsDTO";
import {WholesalersService} from "../../../services/wholesalers.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-add-wholesalers',
  standalone: true,
  imports: [
    NbButtonModule,
    NbIconModule,
    NbTooltipModule,
    NgIf,
    ReactiveFormsModule,
    NbFormFieldModule,
    NbInputModule,
    NgForOf,
    NgbTypeahead,
    NgClass,
    NbSelectModule,
  ],
  templateUrl: './add-wholesalers.component.html',
  styleUrl: './add-wholesalers.component.scss'
})
export class AddWholesalersComponent implements OnInit{
  loading: boolean = false;
  submitted: boolean = false;
  fileData: { [key: number]: any } = {};
  wholesalersForm!: FormGroup
  countries = computed(() => this.locationsService.locations().filter((loc: LocationsDTO) => loc.type === 'country'))
  states = computed(() => this.locationsService.locations().filter((loc: LocationsDTO) => loc.type === 'state'))
  constructor(private location: Location,
              private fb: FormBuilder,
              private toastService: NbToastrService,
              private wsService: WholesalersService,
              private router: Router,
              private locationsService: LocationsService) {
  }
  ngOnInit(): void {
    this.loadForm();
    this.loading = true;
    console.log(this.countries())
  }
  loadForm(){
    this.wholesalersForm = this.fb.group({
      wholesalers: this.fb.array([]) // Initialize the wholesalers array
    });
    // Add an initial wholesaler
    this.addWholesaler();
  }
  // Getter for wholesalers FormArray
  get wholesalers(): FormArray {
    return this.wholesalersForm.get('wholesalers') as FormArray;
  }

  createWholesaler() {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(20), Validators.minLength(3), Validators.pattern('^[^\\s][\\w\\W\\s]*$')]],
      address: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(3), Validators.pattern('^[^\\s][\\w\\W\\s]*$')]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]],
      alternatePhone: ['', [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]],
      shopName: ['', [Validators.required, Validators.maxLength(50), Validators.minLength(3), Validators.pattern('^[^\\s][\\w\\W\\s]*$')]],
      status: ['ACTIVE', Validators.required],
      country: ['', Validators.required],
      country_id: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      state_id: ['', Validators.required],
      bankName: ['',[Validators.required,Validators.minLength(3),Validators.maxLength(50),Validators.pattern('^[A-Za-z ]+$')]],
      bankAccountNumber: ['', [Validators.required, Validators.pattern('^[0-9]{9,18}$')]],
      IFSCCode: ['', [Validators.required, Validators.pattern('^[A-Z]{4}0[A-Z0-9]{6}$')]],
      zipCode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      gstNumber: ['', [Validators.required, Validators.pattern('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$')]],
      panNumber: ['', [Validators.required, Validators.pattern('^[A-Z]{5}[0-9]{4}[A-Z]{1}$')]],
      website: ['',],
      images: [[], Validators.required],
    }, {validators: this.phoneNumbersShouldNotMatchValidator});
  }
  phoneNumbersShouldNotMatchValidator(formGroup: FormGroup) {
    const phone = formGroup.get('phone');
    const alternatePhone = formGroup.get('alternatePhone');
    if (phone && alternatePhone && phone.value === alternatePhone.value) {
      return { phoneNumbersShouldNotMatch: true };  // Custom error if both numbers match
    }
    return null;  // No error if numbers are different
  }

  addWholesaler() {
    // Add a new wholesaler
    const wholesaler = this.createWholesaler();
    this.wholesalers.push(wholesaler);
  }
  backToPrev() {
    this.location.back();
  }
  trimLeadingSpace(event: any) {
    const input = event.target;
    // Remove leading spaces only (but allow spaces between words)
    input.value = input.value.replace(/^\s+/, '');
    // Allow only alphabetic characters and spaces after a character has been entered
    input.value = input.value.replace(/[^a-zA-Z ]/g, '');
    input.dispatchEvent(new Event('input')); // Updates the form control
  }
  // **location Search ngbTypeahead script ** //
  // **Optional ** //
  countrySearch: OperatorFunction<string, LocationsDTO[]> = (text$: Observable<string>) => {
    return text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((searchText: string) => {
        if (!searchText) {
          return [];
        }
        return this.countries().filter((location: any) =>
          location.name.toLowerCase().includes(searchText.toLowerCase())
        );
      })
    );
  };

  countryFormatter = (location: LocationsDTO) => {
    return location && location.name ? location.name : ''; // Ensure it returns a string
  };

  countrySelected(item: any, ws: any) {
   ws.get('country_id').setValue(item._id);
  }

  // **state Search ngbTypeahead script ** //
  // **Optional ** //
  stateSearch: OperatorFunction<string, LocationsDTO[]> = (text$: Observable<string>) => {
    return text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((searchText: string) => {
        if (!searchText) {
          return [];
        }
        return this.states().filter((location: any) =>
          location.name.toLowerCase().includes(searchText.toLowerCase())
        );
      })
    );
  };

  stateFormatter = (location: LocationsDTO) => {
    return location && location.name ? location.name : ''; // Ensure it returns a string
  };

  stateSelected(item: any, ws: any) {
    ws.get('state_id')?.setValue(item._id);
  }

  resetState(ws: any, i: number) {
    ws.get('state')?.setValue('');
    ws.get('state_id')?.setValue('');
  }
  resetCountry(ws: any, i: number) {
    ws.get('country')?.setValue('');
    ws.get('country_id')?.setValue('');
  }

  removeWholesaler(i: number) {
    this.wholesalers.removeAt(i);
  }


  onFileChange(event: any, ws: any, i: number) {
    const file = event.target.files[0];
    console.log(file)
    if (file) {
      this.wholesalers.at(i).get('images')?.setValue(file);
    }
  }
  saveWholesalers() {
    this.submitted = true;
    if (this.wholesalersForm.invalid) return;
    const duplicateValues = (prop: string) => {
      const values = this.wholesalersForm.value.wholesalers.map((w: any) => w[prop]);
      return values.filter((v: any, i: any) => values.indexOf(v) !== i);
    };
    const duplicateEmails = duplicateValues('email');
    const duplicatePhones = duplicateValues('phone');

    if (duplicateEmails.length > 0 || duplicatePhones.length > 0) {
      const message = [
        duplicateEmails.length ? `${duplicateEmails.length} duplicate email(s): ${duplicateEmails.join(', ')}` : '',
        duplicatePhones.length ? `${duplicatePhones.length} duplicate phone number(s): ${duplicatePhones.join(', ')}` : ''
      ].filter(Boolean).join('\n');

      console.error(message);
      this.toastService.warning(message, 'Duplicate wholesaler(s) found', {duration: 2000});
      return;
    }
    const formData = new FormData();
    this.wholesalersForm.value.wholesalers.forEach((wholesaler: any, index: number) => {
      console.log(wholesaler)
      formData.append(`wholesalers[${index}][name]`, wholesaler.name);
      formData.append(`wholesalers[${index}][email]`, wholesaler.email);
      formData.append(`wholesalers[${index}][phone]`, wholesaler.phone);
      formData.append(`wholesalers[${index}][alternatePhone]`, wholesaler.alternatePhone);
      formData.append(`wholesalers[${index}][address]`, wholesaler.address);
      formData.append(`wholesalers[${index}][country_id]`, wholesaler.country_id);
      formData.append(`wholesalers[${index}][city]`, wholesaler.city);
      formData.append(`wholesalers[${index}][state_id]`, wholesaler.state_id);
      formData.append(`wholesalers[${index}][zipCode]`, wholesaler.zipCode);
      formData.append(`wholesalers[${index}][shopName]`, wholesaler.shopName);
      formData.append(`wholesalers[${index}][status]`, wholesaler.status);
      formData.append(`wholesalers[${index}][gstNumber]`, wholesaler.gstNumber);
      formData.append(`wholesalers[${index}][panNumber]`, wholesaler.panNumber);
      formData.append(`wholesalers[${index}][website]`, wholesaler.website);
      formData.append(`wholesalers[${index}][bankName]`, wholesaler.bankName);
      formData.append(`wholesalers[${index}][bankAccountNumber]`, wholesaler.bankAccountNumber);
      formData.append(`wholesalers[${index}][IFSCCode]`, wholesaler.IFSCCode);

      // Ensure that images are appended correctly
      // Append images as File objects instead of JSON
      if (wholesaler.images) {
        // Use wholesaler index to associate images with specific products
        formData.append(`images-${index}`, wholesaler.images);
      }
    });

    //console form data inside saveWholesalers
    // @ts-ignore
    for (const value of formData.values()) {
      console.log(value);
    }
    this.wsService.addWholesalers(formData).subscribe({
      next: (response) => {
        this.toastService.success(response.message, 'Wholesaler(s) added successfully', {duration: 2000});
        this.wholesalersForm.reset();
        this.wholesalers.clear();
        this.router.navigate(['/wholesalers/view']);
      },
      error: (error) => {
        this.toastService.danger(error.error.message, 'Wholesaler(s) not added', {duration: 2000});
      }
    });
  }
}
