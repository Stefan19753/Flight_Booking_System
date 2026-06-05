import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

export interface Booking {
  id: number;
  user_id: number;
  flight_number: string;
  airline: string;
  origin_code: string;
  origin_city: string;
  destination_code: string;
  destination_city: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  price: number;
  passengers: number;
  seat: string;
  status: 'confirmed' | 'cancelled';
  booked_at: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private get api() { return `${this.auth.API}/bookings`; }

  getAll() {
    return this.http.get<Booking[]>(this.api, { headers: this.auth.authHeaders() });
  }

  book(payload: {
    flightNumber: string; airline: string;
    originCode: string; originCity: string;
    destinationCode: string; destinationCity: string;
    departureTime: string; arrivalTime: string;
    duration: string; price: number; passengers: number;
  }) {
    return this.http.post<{ id: number; seat: string }>(this.api, payload, { headers: this.auth.authHeaders() });
  }

  cancel(id: number) {
    return this.http.put(`${this.api}/${id}/cancel`, {}, { headers: this.auth.authHeaders() });
  }
}
