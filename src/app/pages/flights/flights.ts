import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FlightService, Flight } from '../../services/flight.service';
import { BookingService } from '../../services/booking.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-flights',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './flights.html',
  styleUrl: './flights.css'
})
export class Flights implements OnInit {
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private flightService  = inject(FlightService);
  private bookingService = inject(BookingService);
  private cartService    = inject(CartService);
         auth            = inject(AuthService);
  private fb             = inject(FormBuilder);

  flights: Flight[]       = [];
  returnFlights: Flight[] = [];

  searchParams = { origin: '', destination: '', date: '', passengers: 1 };
  isRoundTrip  = false;
  returnDate   = '';

  selectedOutbound: Flight | null = null;
  selectedReturn:   Flight | null = null;

  successMessage = '';
  cartMessage    = '';
  bookedFlightId = '';
  sortBy         = 'price';
  bookingBoth    = false;

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
        origin:      p['origin']      ?? '',
        destination: p['destination'] ?? '',
        date:        p['date']        ?? this.today,
        passengers:  parseInt(p['passengers'] ?? '1'),
      };
      this.isRoundTrip = p['tripType'] === 'round';
      this.returnDate  = p['returnDate'] ?? '';
      this.selectedOutbound = null;
      this.selectedReturn   = null;
      this.refineForm.patchValue(this.searchParams);
      this.loadFlights();
    });
  }

  loadFlights() {
    const { origin, destination, date, passengers } = this.searchParams;
    if (origin && destination) {
      this.flights = this.flightService.searchFlights(origin, destination, date, passengers);
      this.applySorting();
      if (this.isRoundTrip && this.returnDate) {
        this.returnFlights = this.flightService.searchFlights(destination, origin, this.returnDate, passengers);
      }
    }
  }

  applySorting() {
    const sort = (list: Flight[]) =>
      list.sort((a, b) => this.sortBy === 'price' ? a.price - b.price : a.departureTime.localeCompare(b.departureTime));
    sort(this.flights);
    sort(this.returnFlights);
  }

  onRefineSearch() {
    if (this.refineForm.invalid) return;
    const v = this.refineForm.value;
    this.router.navigate(['/flights'], {
      queryParams: { origin: v.origin, destination: v.destination, date: v.date, passengers: v.passengers }
    });
  }

  selectOutbound(flight: Flight) {
    this.selectedOutbound = this.selectedOutbound?.id === flight.id ? null : flight;
  }

  selectReturn(flight: Flight) {
    this.selectedReturn = this.selectedReturn?.id === flight.id ? null : flight;
  }

  bookBoth() {
    if (!this.selectedOutbound || !this.selectedReturn) return;
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/login']); return; }
    this.bookingBoth = true;
    this.bookingService.book(this.toPayload(this.selectedOutbound)).subscribe({
      next: (res1) => {
        this.bookingService.book(this.toPayload(this.selectedReturn!)).subscribe({
          next: (res2) => {
            this.successMessage = `Round trip booked! Outbound #${res1.id} (${res1.seat}) · Return #${res2.id} (${res2.seat})`;
            this.selectedOutbound = null;
            this.selectedReturn   = null;
            this.bookingBoth      = false;
            window.scrollTo({ top: 0, behavior: 'smooth' });
          },
          error: () => { this.successMessage = 'Return flight booking failed.'; this.bookingBoth = false; }
        });
      },
      error: () => { this.successMessage = 'Outbound flight booking failed.'; this.bookingBoth = false; }
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
      error: () => { this.successMessage = 'Booking failed. Please try again.'; }
    });
  }

  addToCart(flight: Flight) {
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/login']); return; }
    this.cartService.addItem(this.toPayload(flight)).subscribe({
      next: () => {
        this.cartMessage = `${flight.flightNumber} added to cart!`;
        setTimeout(() => this.cartMessage = '', 3000);
      },
      error: () => { this.cartMessage = 'Could not add to cart.'; }
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

  get bothSelected() { return this.selectedOutbound !== null && this.selectedReturn !== null; }
  get totalRoundTripPrice() {
    return (this.selectedOutbound?.price ?? 0) + (this.selectedReturn?.price ?? 0);
  }
}
