import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NbButtonModule, NbFormFieldModule, NbIconModule, NbInputModule} from "@nebular/theme";
import {NgIf} from "@angular/common";
import {DividerModule} from "primeng/divider";
import {Button} from "primeng/button";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{
  loginForm: FormGroup | any;
  submitted: boolean = false;
  loading: boolean = false;
  showPassword : boolean = false;
  ifForgot: boolean = false;
  constructor(private fb: FormBuilder) {
  }
  get l(){
    return this.loginForm.controls
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
  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  loadForm(){
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    })
  }
  login(){
    this.submitted = true;
    if(this.loginForm.invalid){
      return;
    } else {
    }
  }

}
