import {Component, OnInit} from '@angular/core';
import {NbButtonModule, NbFormFieldModule, NbIconModule, NbInputModule, NbTooltipModule} from "@nebular/theme";
import {NgIf} from "@angular/common";
import {Location} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";

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
    NbInputModule
  ],
  templateUrl: './add-wholesalers.component.html',
  styleUrl: './add-wholesalers.component.scss'
})
export class AddWholesalersComponent implements OnInit{
  loading: boolean = false;
  wholesalersForm!: FormGroup
  constructor(private location: Location, private fb: FormBuilder) {
  }
  ngOnInit(): void {
    this.loadForm();
    this.loading = true;
  }
  loadForm(){
    this.wholesalersForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      email: ['', Validators.required],
      phone: ['', Validators.required],
      status: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      website: ['', Validators.required],
      description: ['', Validators.required],
      image: ['', Validators.required],
    })
  }

  backToPrev() {
    this.location.back();
  }
}
