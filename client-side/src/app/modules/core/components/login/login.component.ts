import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NbButtonModule, NbFormFieldModule, NbIconModule, NbInputModule} from "@nebular/theme";
import {NgClass, NgIf} from "@angular/common";
import {DividerModule} from "primeng/divider";
import {Button} from "primeng/button";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {MessageService} from "primeng/api";
import {UserService} from "../../../../services/user.service";
import {RegisterUserDTO} from "../../../../models/userDTO";
import {ResponseWithError} from "../../../../models/commonDTO";
import {ToastModule} from "primeng/toast";
import {AuthService} from "../../../../services/auth.service";

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
  constructor(private fb: FormBuilder,
              private as: AuthService,
              private us: UserService,
              private route: ActivatedRoute,
              private ms: MessageService,
              private router: Router) {
  }
  get l(){
    return this.loginForm.controls
  }
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.ifForgot = params['resetPassword'] === 'again';

      if ('resetPassword' in params && params['resetPassword'] !== 'again') {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { resetPassword: null },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      }
    });


    // Check if user is already authenticated
    if (this.as.isAuthenticated()) {
      return this.redirectAfterLogin();
    }
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
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    })
  }
  redirectAfterLogin() {
    let redirectUrl = '/';

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        redirectUrl = localStorage.getItem('redirectUrl') || '/';
        localStorage.removeItem('redirectUrl');
      }
    } catch (e) {
      console.error('localStorage not available:', e);
    }

    this.router.navigateByUrl(redirectUrl);
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
            this.ms.add({severity: 'error', summary: 'User', detail: res.message});
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
      this.as.login(this.loginForm.value.email, this.loginForm.value.password)
        .subscribe({
          next: (response) => {
            if (response.success) {
                    this.loginForm.reset();
                    this.submitted = false;
              // Navigate to return url or dashboard
              this.navigateAfterLogin();
            } else { // @ts-ignore
              if(response.response === 'notFound'){
                this.ms.add({severity: 'warn', summary: 'User', detail: response.message});
              } else { // @ts-ignore
                if (response.response === 'notMatched') {
                  this.ms.add({severity: 'error', summary: 'User', detail: response.message});
                } else {
                  this.ms.add({severity: 'error', summary: 'Error', detail: response.message});
                }
              }
            }
          },
          error: (error) => {
            console.error('Login error:', error);
            this.loading = false;
                this.ms.add({severity: 'error', summary: 'Error', detail: error});
          }
        });
    }
  }
  navigateAfterLogin() {
      // Check if there's a stored redirect URL
      const redirectUrl = localStorage.getItem('redirectUrl') || '/dashboard/view';
      localStorage.removeItem('redirectUrl'); // Clear the stored URL
      this.router.navigateByUrl(redirectUrl);
  }
}
