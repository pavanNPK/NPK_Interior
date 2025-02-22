import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import {Button} from "primeng/button";
import {DividerModule} from "primeng/divider";
import {NbButtonModule, NbFormFieldModule, NbIconModule, NbInputModule} from "@nebular/theme";
import {NgIf} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NbInputModule,
    NbButtonModule,
    NgIf,
    DividerModule,
    NbFormFieldModule,
    NbIconModule,
    Button,
    RouterLink,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit{
  registerForm: FormGroup | any;
  submitted: boolean = false;
  loading: boolean = false;
  showPassword : boolean = false;
  ifForgot: boolean = false;
  constructor(private fb: FormBuilder) {
  }
  get r(){
    return this.registerForm.controls
  }
  ngOnInit() {
    this.loadForm();
    this.loading = true;
  }
  getInputType() {
    if (this.showPassword) {
      return 'text';
    }
    return 'password';
  }

  loadForm(){
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      userName: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required]
    })
  }
  register(){
    this.submitted = true;
    if(this.registerForm.invalid){
      return;
    } else {
    }
  }

}
