import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

function passwordMatch(ctrl: AbstractControl) {
  return ctrl.get('password')?.value === ctrl.get('confirmPassword')?.value
    ? null : { mismatch: true };
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    firstName:       ['', [Validators.required, Validators.minLength(2)]],
    lastName:        ['', [Validators.required, Validators.minLength(2)]],
    email:           ['', [Validators.required, Validators.email]],
    password:        ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatch });

  error = '';
  loading = false;

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    const { firstName, lastName, email, password } = this.form.value;
    this.auth.register(firstName!, lastName!, email!, password!).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => {
        this.error = err.error?.error ?? 'Registration failed. Please try again.';
        this.loading = false;
      },
    });
  }

  get f() { return this.form.controls; }
}
