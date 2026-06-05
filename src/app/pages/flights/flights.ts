import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FlightService, Flight } from '../../services/flight.service';
import { BookingService } from '../../services/booking.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-flights',
  imports: [ReactiveFormsModule],
  templateUrl: './flights.html',
  styleUrl: './flights.css'
})
export class Flights implements OnInit {
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private flightService  = inject(FlightService);
  private bookingService = inject(BookingService);
  private cartService    = inject(CartService);
  private auth           = inject(AuthService);
  private fb             = inject(FormBuilder);

  flights: Flight[] = [];
  searchParams = { origin: '', destination: '', date: '', passengers: 1 };
  successMessage = '';
  cartMessage = '';
  bookedFlightId = '';
  sortBy = 'price';

  refineForm = this.fb.group({
    origin:      ['', Validators.required],
    destination: ['', Validators.required],
    date:        ['', Validators.required],
    passengers:  [1, [Validators.required, Validators.min(1)]],
  });

  airports = this.flightService.getAirports();
  today    = new Date().toISOString().split('T')[0];

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      this.searchParams = {
        origin:     p['origin']     ?? '',
        destination:p['destination']?? '',
        date:       p['date']       ?? this.today,
        passengers: parseInt(p['passengers'] ?? '1'),
      };
      this.refineForm.patchValue(this.searchParams);
      this.loadFlights();
    });
  }

  loadFlights() {
    const { origin, destination, date, passengers } = this.searchParams;
    if (origin && destination) {
      this.flights = this.flightService.searchFlights(origin, destination, date, passengers);
      this.applySorting();
    }
  }

  applySorting() {
    this.flights.sort((a, b) =>
      this.sortBy === 'price' ? a.price - b.price : a.departureTime.localeCompare(b.departureTime)
    );
  }

  onRefineSearch() {
    if (this.refineForm.invalid) return;
    const v = this.refineForm.value;
    this.router.navigate(['/flights'], {
      queryParams: { origin: v.origin, destination: v.destination, date: v.date, passengers: v.passengers }
    });
  }

  bookFlight(flight: Flight) {
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/login']); return; }
    this.bookingService.book(this.toPayload(flight)).subscribe({
      next: (res) => {
        this.successMessage = `Booking confirmed! ID: #${res.id} | Seat: ${res.seat}`;
        this.bookedFlightId = flight.id;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: () => { this.successMessage = 'Booking failed. Is the backend running?'; }
    });
  }

  addToCart(flight: Flight) {
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/login']); return; }
    this.cartService.addItem(this.toPayload(flight)).subscribe({
      next: () => {
        this.cartMessage = `${flight.flightNumber} added to cart!`;
        setTimeout(() => this.cartMessage = '', 3000);
      },
      error: () => { this.cartMessage = 'Could not add to cart. Is the backend running?'; }
    });
  }

  private toPayload(flight: Flight) {
    return {
      flightNumber:    flight.flightNumber,
      airline:         flight.airline,
      originCode:      flight.origin.code,
      originCity:      flight.origin.city,
      destinationCode: flight.destination.code,
      destinationCity: flight.destination.city,
      departureTime:   flight.departureTime,
      arrivalTime:     flight.arrivalTime,
      duration:        flight.duration,
      price:           flight.price,
      passengers:      this.searchParams.passengers,
    };
  }

  getOriginName() { return this.airports.find(a => a.code === this.searchParams.origin)?.city ?? this.searchParams.origin; }
  getDestName()   { return this.airports.find(a => a.code === this.searchParams.destination)?.city ?? this.searchParams.destination; }
}
