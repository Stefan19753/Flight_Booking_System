import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  form = this.fb.group({
    password:        ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  token = '';
  loading = false;
  success = false;
  error = '';

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.error = 'Invalid reset link. Please request a new one.';
    }
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { password, confirmPassword } = this.form.value;
    if (password !== confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }
    this.loading = true;
    this.error = '';
    this.auth.resetPassword(this.token, password!).subscribe({
      next: () => { this.success = true; this.loading = false; },
      error: (err) => {
        this.error = err.error?.error ?? 'Reset failed. The link may have expired.';
        this.loading = false;
      },
    });
  }

  get passwordCtrl()        { return this.form.get('password')!; }
  get confirmPasswordCtrl() { return this.form.get('confirmPassword')!; }
}
