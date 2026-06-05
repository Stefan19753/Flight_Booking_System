import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookingService, Booking } from '../../services/booking.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-my-bookings',
  imports: [RouterLink, DatePipe],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.css'
})
export class MyBookings implements OnInit {
  private bookingService = inject(BookingService);

  bookings: Booking[] = [];
  loading = true;
  error = '';
  cancelConfirmId = 0;

  ngOnInit() { this.loadBookings(); }

  loadBookings() {
    this.bookingService.getAll().subscribe({
      next: b => { this.bookings = b; this.loading = false; },
      error: () => { this.error = 'Could not load bookings. Is the backend running?'; this.loading = false; },
    });
  }

  confirmCancel(id: number) { this.cancelConfirmId = id; }

  doCancel(id: number) {
    this.bookingService.cancel(id).subscribe({ next: () => { this.cancelConfirmId = 0; this.loadBookings(); } });
  }

  get confirmed() { return this.bookings.filter(b => b.status === 'confirmed'); }
  get cancelled()  { return this.bookings.filter(b => b.status === 'cancelled'); }
}
