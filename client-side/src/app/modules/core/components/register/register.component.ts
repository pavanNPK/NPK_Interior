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
import {RouterLink} from "@angular/router";
import {TooltipModule} from "primeng/tooltip";
import {RegisterUserDTO} from "../../../../models/userDTO";
import {UserService} from "../../../../services/user.service";
import {ResponseWithError} from "../../../../models/commonDTO";
import {MessageService} from "primeng/api";
import {Toast, ToastModule} from "primeng/toast";
import {Ripple, RippleModule} from "primeng/ripple";

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
  loading: boolean = false;
  showPassword : boolean = false;
  isRegister : boolean = true;
  isSendOTP : boolean = false;
  isSendOTPEdit : boolean = false;
  isOTPSuccess: boolean = false;
  constructor(private fb: FormBuilder, private us: UserService, private ms: MessageService) {
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

  loadForm() {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      userName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(8)]], // Max 8 characters
      email: ['', [Validators.required, Validators.email]],
      // password: ['', [
      //   Validators.required,
      //   Validators.minLength(8),
      //   Validators.pattern(/.*[A-Z].*/),  // Uppercase
      //   Validators.pattern(/.*[a-z].*/),  // Lowercase
      //   Validators.pattern(/.*[0-9].*/),  // Number
      //   Validators.pattern(/.*[!@#$%^&*()].*/),  // Special char
      // ]],
      // otp: ['', [
      //   Validators.required,
      //   Validators.minLength(6),
      //   Validators.maxLength(6),
      // ]],
      password: [''],
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
    // Allow only alphabetic characters and spaces after a character has been entered
    input.value = input.value.replace(/[^0-9 ]/g, '');
    input.dispatchEvent(new Event('input')); // Updates the form control
  }
  register(){
    this.submitted = true;
    if(this.registerForm.invalid){
      return;
    } else {
      console.log(this.registerForm.value);
      const data = new RegisterUserDTO();
      data.firstName = this.registerForm.value.firstName;
      data.lastName = this.registerForm.value.lastName;
      data.userName = this.registerForm.value.userName;
      data.email = this.registerForm.value.email;
      data.role = 'end_user';
      console.log(data)
      this.us.registerUser(data).subscribe({
        next: (res: ResponseWithError<any>) => {
          if(res.success){
            this.isRegister = false;
            this.submitted = false;
            this.isSendOTP = true;
            this.ms.add({ severity: 'success', summary: 'OTP', detail: 'OTP has been sent to your email.' });
          } else {
            this.ms.add({ severity: 'error', summary: 'Duplicate', detail: 'Email already registered' });
          }
        },
        error: (err) => {
        },
        complete: () => {
          console.log('Registration completed');
        }
      })
    }
  }
  confirmOTP(){

  }
  registerUser(){

  }
}
