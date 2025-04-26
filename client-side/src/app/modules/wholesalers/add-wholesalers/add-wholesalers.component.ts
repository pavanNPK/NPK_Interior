import {Component, computed, OnInit} from '@angular/core';
import {
  NbButtonModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule, NbSelectModule,
  NbTooltipModule
} from "@nebular/theme";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {Location} from "@angular/common";
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {LocationsService} from "../../../services/locations.service";
import {NgbTypeahead} from "@ng-bootstrap/ng-bootstrap";
import {debounceTime, distinctUntilChanged, map, Observable, OperatorFunction} from "rxjs";
import {LocationsDTO} from "../../../models/locationsDTO";

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
  wholesalersForm!: FormGroup
  countries = computed(() => this.locationsService.locations().filter((loc: LocationsDTO) => loc.type === 'country'))
  states = computed(() => this.locationsService.locations().filter((loc: LocationsDTO) => loc.type === 'state'))
  constructor(private location: Location, private fb: FormBuilder, private locationsService: LocationsService) {
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
      name: ['', Validators.required],
      address: ['', Validators.required],
      email: ['', Validators.required],
      phone: ['', Validators.required],
      alternatePhone: ['', Validators.required],
      shopName: ['', Validators.required],
      status: ['ACTIVE', Validators.required],
      country: ['', Validators.required],
      country_id: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      state_id: ['', Validators.required],
      zipCode: ['', Validators.required],
      website: ['', Validators.required],
      description: ['', Validators.required],
      image: ['', Validators.required],
    });
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

  countrySelected(item: any) {
    // this.ws['country_id'].setValue(item.id);
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

  stateSelected(item: any) {
    // this.ws['state_id'].setValue(item.id);
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
  saveWholesalers() {
    this.submitted = true;
    if (this.wholesalersForm.invalid) {
      return;
    } else {
      console.log(this.wholesalersForm.value);
    }
  }

  onFileChange(event: any, ws: any) {

  }
}
