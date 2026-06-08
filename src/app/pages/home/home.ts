import { Component, inject, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LowerCasePipe } from '@angular/common';
import { FlightService } from '../../services/flight.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [ReactiveFormsModule, LowerCasePipe],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  @ViewChild('searchCard') searchCard!: ElementRef;

  private fb = inject(FormBuilder);
  private flightService = inject(FlightService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  auth = inject(AuthService);

  airports = this.flightService.getAirports();
  today = new Date().toISOString().split('T')[0];
  tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  searchError = '';
  tripType: 'one-way' | 'round-trip' = 'one-way';

  destinations = [
    { code: 'BCN', city: 'Barcelona', country: 'Spain' },
    { code: 'NRT', city: 'Tokyo', country: 'Japan' },
    { code: 'LHR', city: 'London', country: 'United Kingdom' },
    { code: 'DXB', city: 'Dubai', country: 'UAE' },
    { code: 'CDG', city: 'Paris', country: 'France' },
    { code: 'SIN', city: 'Singapore', country: 'Singapore' },
    { code: 'SYD', city: 'Sydney', country: 'Australia' },
    { code: 'JFK', city: 'New York', country: 'USA' },
  ];

  form = this.fb.group({
    origin:      ['', Validators.required],
    destination: ['', Validators.required],
    date:        [this.today, Validators.required],
    returnDate:  [''],
    passengers:  [1, [Validators.required, Validators.min(1), Validators.max(9)]],
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['dest']) {
        this.form.patchValue({ destination: params['dest'] });
      }
    });
  }

  setTripType(type: 'one-way' | 'round-trip') {
    this.tripType = type;
    const returnDateCtrl = this.form.get('returnDate')!;
    if (type === 'round-trip') {
      returnDateCtrl.setValidators([Validators.required]);
      returnDateCtrl.patchValue(this.tomorrow);
    } else {
      returnDateCtrl.clearValidators();
      returnDateCtrl.patchValue('');
    }
    returnDateCtrl.updateValueAndValidity();
  }

  selectDestination(code: string) {
    this.form.patchValue({ destination: code });
    this.searchCard.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  onSearch() {
    this.searchError = '';
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { origin, destination } = this.form.value;
    if (origin === destination) {
      this.searchError = 'Origin and destination cannot be the same.';
      return;
    }
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/login']); return; }
    const { date, returnDate, passengers } = this.form.value;
    const params: Record<string, any> = { origin, destination, date, passengers };
    if (this.tripType === 'round-trip' && returnDate) {
      params['tripType'] = 'round';
      params['returnDate'] = returnDate;
    }
    this.router.navigate(['/flights'], { queryParams: params });
  }
}
