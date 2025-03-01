import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NbButtonModule, NbFormFieldModule, NbIconModule, NbInputModule} from "@nebular/theme";
import {NgClass, NgIf} from "@angular/common";
import {DividerModule} from "primeng/divider";
import {Button} from "primeng/button";
import {Router, RouterLink} from "@angular/router";
import {MessageService} from "primeng/api";
import {UserService} from "../../../../services/user.service";
import {RegisterUserDTO} from "../../../../models/userDTO";
import {ResponseWithError} from "../../../../models/commonDTO";
import {ToastModule} from "primeng/toast";

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
    NgClass,
    ToastModule,
  ],
  providers: [MessageService],
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
  constructor(private fb: FormBuilder, private us: UserService, private ms: MessageService, private router: Router) {
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

  loadForm(){
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    })
  }

  forgotPassword() {
    this.submitted = false;
    this.ifForgot = true;
    this.loginForm.reset();
    this.loginForm.get('password').clearValidators();
    this.loginForm.get('password').updateValueAndValidity();
  }

  backToLogin() {
    this.submitted = false;
    this.ifForgot = false;
    this.loginForm.reset();
    this.loginForm.get('password').setValidators([Validators.required]);
    this.loginForm.get('password').updateValueAndValidity();
  }

  changePassword() {
    this.submitted = true;
    if(this.loginForm.invalid){
      return;
    } else {
      const data = new RegisterUserDTO();
      data.email = this.loginForm.value.email;
      this.us.forgotPassword(data).subscribe({
        next: (res: ResponseWithError<any>) => {
          if(res.success){
            this.loginForm.reset();
            this.ifForgot = false; // Reset ifForgot to false after successful password change
            this.submitted = false;
            this.ms.add({severity: 'success', summary: 'Forgot Password', detail: res.message});
          } else {
            this.ms.add({severity: 'error', summary: 'Error', detail: res.message});
          }
        },
        error: (err: any) => {
          this.loading = false;
          this.ms.add({severity: 'error', summary: 'Error', detail: err.error.message});
        }
      })
    }
  }

  login(){
    this.submitted = true;
    if(this.loginForm.invalid){
      return;
    } else {
      const data = new RegisterUserDTO();
      data.email = this.loginForm.value.email;
      data.password = this.loginForm.value.password;
      this.us.loginUser(data).subscribe({
        next: (res: ResponseWithError<any>) => {
          if(res.success){
            this.loginForm.reset();
            this.router.navigate(['']);
            this.submitted = false;
          } else if(res.response === 'notFound'){
            this.ms.add({severity: 'warn', summary: 'User', detail: res.message});
          } else if (res.response === 'notMatched') {
            this.ms.add({severity: 'error', summary: 'User', detail: res.message});
          } else {
            this.ms.add({severity: 'error', summary: 'Error', detail: res.message});
          }
        },
        error: (err: any) => {
          this.loading = false;
          this.ms.add({severity: 'error', summary: 'Error', detail: err.error.message});
        }
      })
    }
  }
}
