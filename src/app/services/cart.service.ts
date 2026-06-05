import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { tap } from 'rxjs/operators';

export interface CartItem {
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
  added_at: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private get api() { return `${this.auth.API}/cart`; }

  items = signal<CartItem[]>([]);
  count = computed(() => this.items().length);
  total = computed(() => this.items().reduce((s, i) => s + Number(i.price), 0));

  loadCart() {
    if (!this.auth.isLoggedIn()) { this.items.set([]); return; }
    this.http.get<CartItem[]>(this.api, { headers: this.auth.authHeaders() })
      .subscribe({ next: items => this.items.set(items), error: () => {} });
  }

  addItem(flight: { flightNumber: string; airline: string; originCode: string; originCity: string;
    destinationCode: string; destinationCity: string; departureTime: string; arrivalTime: string;
    duration: string; price: number; passengers: number }) {
    return this.http.post<{ id: number }>(this.api, flight, { headers: this.auth.authHeaders() }).pipe(
      tap(() => this.loadCart())
    );
  }

  removeItem(id: number) {
    return this.http.delete(`${this.api}/${id}`, { headers: this.auth.authHeaders() }).pipe(
      tap(() => this.items.update(items => items.filter(i => i.id !== id)))
    );
  }

  checkout() {
    return this.http.post<{ success: boolean; bookingIds: number[] }>(
      `${this.api}/checkout`, {}, { headers: this.auth.authHeaders() }
    ).pipe(tap(() => this.items.set([])));
  }
}
