import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import {Button} from "primeng/button";
import {DividerModule} from "primeng/divider";
import {NbButtonModule, NbFormFieldModule, NbIconModule, NbInputModule} from "@nebular/theme";
import {NgClass, NgIf} from "@angular/common";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import {Router, RouterLink} from "@angular/router";
import {TooltipModule} from "primeng/tooltip";
import {RegisterUserDTO} from "../../../../models/userDTO";
import {UserService} from "../../../../services/user.service";
import {ResponseWithError} from "../../../../models/commonDTO";
import {MessageService} from "primeng/api";
import {ToastModule} from "primeng/toast";
import { RippleModule} from "primeng/ripple";

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
    NgClass,
    TooltipModule,
    ToastModule,
    RippleModule,
  ],
  providers: [MessageService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit{
  registerForm: FormGroup | any;
  submitted: boolean = false;
  originalEmail: string = '';
  loading: boolean = false;
  showPassword : boolean = false;
  showCPassword : boolean = false;
  isRegister : boolean = true;
  isSendOTP : boolean = false;
  reEnterEmail : boolean = false;
  isSendOTPEdit : boolean = false;
  isOTPSuccess: boolean = false;
  constructor(private fb: FormBuilder, private us: UserService, private ms: MessageService, private router: Router) {
  }
  get r(){
    return this.registerForm.controls
  }
  ngOnInit() {
    this.loadForm();
    this.loading = true;
  }

  loadForm() {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      userName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]], // Max 10 characters
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      confirmPassword: [''],
      otp: [''],
    });
  }
  get passwordErrors() {
    const control = this.registerForm.get('password');
    return {
      required: control?.hasError('required'),
      minlength: control?.hasError('minlength'),
      uppercase: control?.hasError('pattern') && !/.*[A-Z].*/.test(control?.value || ''),
      lowercase: control?.hasError('pattern') && !/.*[a-z].*/.test(control?.value || ''),
      number: control?.hasError('pattern') && !/.*[0-9].*/.test(control?.value || ''),
      special: control?.hasError('pattern') && !/.*[!@#$%^&*()].*/.test(control?.value || '')
    };
  }
  trimLeadingSpace(event: any) {
    const input = event.target;
    // Remove leading spaces only (but allow spaces between words)
    input.value = input.value.replace(/^\s+/, '');
    // Allow only numbers and spaces after a character has been entered
    input.value = input.value.replace(/[^0-9 ]/g, '');
    input.dispatchEvent(new Event('input')); // Updates the form control
  }
  sendOTP(){
    this.submitted = true;
    if(this.registerForm.invalid){
      return;
    } else {
      const data = new RegisterUserDTO();
      data.firstName = this.registerForm.value.firstName;
      data.lastName = this.registerForm.value.lastName;
      data.userName = this.registerForm.value.userName;
      data.email = this.registerForm.value.email;
      data.role = 'shopper';
      this.us.sendOTP(data).subscribe({
        next: (res: ResponseWithError<any>) => {
          if(res.success){
            this.isRegister = false;
            this.submitted = false;
            this.isSendOTP = true;
            this.isSendOTPEdit = true;
            this.registerForm.get('otp').setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(6)]);
            this.ms.add({ severity: 'success', summary: 'OTP', detail: 'OTP has been sent to your email.' });
          } else {
            this.ms.add({ severity: 'warn', summary: 'Duplicate', detail: 'Email already registered' });
          }
        },
        error: (err) => {
        },
        complete: () => {
        }
      })
    }
  }
  confirmOTP(){
    this.submitted = true;
    if(this.registerForm.invalid){
      return;
    } else {
      const data = new RegisterUserDTO();
      data.email = this.registerForm.value.email;
      data.otp = this.registerForm.value.otp;
      this.us.confirmOTP(data).subscribe({
        next: (res: ResponseWithError<any>) => {
          if (res.success) {
            this.isOTPSuccess = true;
            this.isSendOTP = false;
            this.isSendOTPEdit = false;
            this.submitted = false;
            this.registerForm.get('password').setValidators([
              Validators.required,
              Validators.minLength(8),
              Validators.pattern(/.*[A-Z].*/),  // Uppercase
              Validators.pattern(/.*[a-z].*/),  // Lowercase
              Validators.pattern(/.*[0-9].*/),  // Number
              Validators.pattern(/.*[!@#$%^&*()].*/),  // Special char
            ])
            // Confirm password validation with matching
            this.registerForm.get('confirmPassword').setValidators([
              Validators.required,
              this.mustMatch()
            ]);

            // Update both fields
            this.registerForm.get('password').updateValueAndValidity();
            this.registerForm.get('confirmPassword').updateValueAndValidity();
            this.ms.add({severity: 'success', summary: 'OTP', detail: 'OTP has been verified'});
          } else {
            this.ms.add({severity: 'warn', summary: 'OTP', detail: res.message});
          }
        },
        error: (err) => {
        },
        complete: () => {
        }
      })
    }
  }
  // Add this function to your component
  private mustMatch(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = this.registerForm?.get('password')?.value;
      const confirmPassword = control.value;

      return password === confirmPassword ? null : { mustMatch: true };
    };
  }

  registerUser(){
    this.submitted = true;
    if(this.registerForm.invalid){
      return;
    } else {
      const data = new RegisterUserDTO();
      data.userName = this.registerForm.value.userName;
      data.email = this.registerForm.value.email;
      data.password = this.registerForm.value.password;
      if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
        this.ms.add({ severity: 'warn', summary: 'Password', detail: 'Password and Confirm Password do not match' });
        return;
      }
      data.role = 'shopper';
      this.us.registerUser(data).subscribe({
        next: (res: ResponseWithError<any>) => {
          if(res.success){
            this.isRegister = false;
            this.submitted = false;
            this.isSendOTP = true;
            this.isSendOTPEdit = true;
            this.registerForm.get('otp').setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(6)]);
            this.ms.add({ severity: 'success', summary: 'OTP', detail: 'You have been registered successfully' });
            // navigate to home page
            this.router.navigate(['']);
          } else {
            this.ms.add({ severity: 'warn', summary: 'Duplicate', detail: res.message });
          }
        },
        error: (err) => {
        },
        complete: () => {
        }
      })
    }
  }

  editEmail() {
    this.originalEmail = this.registerForm.get('email').value;
    this.reEnterEmail = true;
    this.isSendOTPEdit = false;
    this.registerForm.get('otp').clearValidators();
    this.registerForm.get('otp').updateValueAndValidity();
  }

  saveEmail() {
    this.reEnterEmail = false;
    this.isSendOTPEdit = true;
    this.sendOTP();
  }

  cancelEmail() {
    // Use patchValue instead of setValue for more reliable form updates
    this.registerForm.patchValue({
      email: this.originalEmail
    });
    this.reEnterEmail = false;
    this.isSendOTPEdit = true;
  }

  openInNewTab(route: string) {
    window.open(route, '_blank');
  }

}
