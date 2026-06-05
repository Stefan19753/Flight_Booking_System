import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FlightService } from '../../services/flight.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  private fb = inject(FormBuilder);
  private flightService = inject(FlightService);
  private router = inject(Router);
  auth = inject(AuthService);

  airports = this.flightService.getAirports();
  today = new Date().toISOString().split('T')[0];
  searchError = '';

  form = this.fb.group({
    origin: ['', Validators.required],
    destination: ['', Validators.required],
    date: [this.today, Validators.required],
    passengers: [1, [Validators.required, Validators.min(1), Validators.max(9)]],
  });

  onSearch() {
    this.searchError = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { origin, destination } = this.form.value;
    if (origin === destination) {
      this.searchError = 'Origin and destination cannot be the same.';
      return;
    }
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    const { date, passengers } = this.form.value;
    this.router.navigate(['/flights'], { queryParams: { origin, destination, date, passengers } });
  }
}
