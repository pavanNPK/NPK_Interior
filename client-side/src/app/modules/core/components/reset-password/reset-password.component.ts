import {Component, OnInit} from '@angular/core';
import {DividerModule} from "primeng/divider";
import {NgClass, NgIf} from "@angular/common";
import {PaginatorModule} from "primeng/paginator";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {NbButtonModule, NbFormFieldModule, NbIconModule, NbInputModule} from "@nebular/theme";
import {Button} from "primeng/button";
import {MessageService} from "primeng/api";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {UserService} from "../../../../services/user.service";
import {ResponseWithError} from "../../../../models/commonDTO";
import {CookieService} from "ngx-cookie-service";

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    DividerModule,
    NgIf,
    PaginatorModule,
    ReactiveFormsModule,
    NbButtonModule,
    NbFormFieldModule,
    NbIconModule,
    NbInputModule,
    NgClass,
    Button,
    RouterLink
  ],
  providers: [MessageService],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit{
  loading = false;
  submitted = false;
  showPassword = false;
  showCPassword = false;
  resetPasswordForm?: FormGroup | any;
  token: any | null = '';
  constructor(private fb: FormBuilder,
              private us: UserService,
              private ms: MessageService,
              private cookieService: CookieService,
              private route: ActivatedRoute,
              private router: Router) {
  }
  get r(){
    return this.resetPasswordForm.controls
  }
  ngOnInit() {
    // First check for token in URL parameters
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        // If token exists in URL, save it to cookie
        this.token = params['token'];
        this.cookieService.set('resetToken', this.token, {
          path: '/',
          sameSite: 'Lax'
        });
        this.loadForm();
        this.loading = true;
      } else {
        // If not in URL, check cookie
        this.token = this.cookieService.get('resetToken');
        if (this.token) {
          this.loadForm();
          this.loading = true;
        } else {
          // No token found - show access denied
          this.loading = false;
          this.ms.add({severity: 'error', summary: 'Error', detail: 'Invalid or expired reset link'});
        }
      }
    });
  }
  loadForm() {
    this.resetPasswordForm = this.fb.group({
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        ]
      ],
      confirmPassword: ['', [Validators.required, this.mustMatch()]]
    });
  }
  get passwordErrors() {
    const control = this.resetPasswordForm?.get('password');
    return {
      required: control?.hasError('required'),
      minlength: control?.hasError('minlength'),
      uppercase: control?.hasError('pattern') && !/.*[A-Z].*/.test(control?.value || ''),
      lowercase: control?.hasError('pattern') && !/.*[a-z].*/.test(control?.value || ''),
      number: control?.hasError('pattern') && !/.*[0-9].*/.test(control?.value || ''),
      special: control?.hasError('pattern') && !/.*[!@#$%^&*()].*/.test(control?.value || '')
    };
  }
  // Add this function to your component
  private mustMatch(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = this.resetPasswordForm?.get('password')?.value;
      const confirmPassword = control.value;

      return password === confirmPassword ? null : { mustMatch: true };
    };
  }

  submit() {
    this.submitted = true;
    if (this.resetPasswordForm.invalid) {
      return;
    } else {
      if (this.resetPasswordForm.value.password !== this.resetPasswordForm.value.confirmPassword) {
        this.ms.add({ severity: 'warn', summary: 'Password', detail: 'Password and Confirm Password do not match' });
        return;
      }
      const requestData = {
        token: this.token,  // Send the reset token from the URL
        password: this.resetPasswordForm.value.password
      };
      this.us.resetPassword(requestData).subscribe({
        next: (res: ResponseWithError<any>) => {
          if(res.success){
            this.resetPasswordForm.reset();
            this.submitted = false;
            this.ms.add({severity: 'success', summary: 'Reset Password', detail: res.message});
            this.router.navigate(['/login']);
          } else {
            this.ms.add({severity: 'error', summary: 'Error', detail: res.message});
          }
        },
        error: (err: any) => {
          this.loading = false;
          this.ms.add({severity: 'error', summary: 'Error', detail: err.error.message});
        }, complete: () => {
          this.cookieService.delete('resetToken', '/');
        }
      })
    }
  }
}
