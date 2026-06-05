import { Component, inject, OnInit, OnDestroy, AfterViewInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';

declare var L: any;

export interface RealFlight {
  icao24: string;
  callsign: string;
  originCountry: string;
  longitude: number;
  latitude: number;
  altitude: number;
  onGround: boolean;
  velocity: number;
  heading: number;
  verticalRate: number;
}

@Component({
  selector: 'app-tracker',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './tracker.html',
  styleUrl: './tracker.css'
})
export class Tracker implements AfterViewInit, OnDestroy {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private map: any;
  private markerLayer: any;
  private selectedMarker: any;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  flights = signal<RealFlight[]>([]);
  selectedFlight = signal<RealFlight | null>(null);
  searchQuery = '';
  loading = signal(false);
  error = signal('');
  lastUpdated = signal('');

  get filteredFlights() {
    const q = this.searchQuery.trim().toUpperCase();
    return q
      ? this.flights().filter(f => f.callsign?.includes(q) || f.originCountry?.toUpperCase().includes(q))
      : this.flights();
  }

  ngAfterViewInit() {
    this.initMap();
    this.loadFlights();
    this.intervalId = setInterval(() => this.loadFlights(), 60_000);
  }

  private initMap() {
    this.map = L.map('leaflet-map', { center: [20, 10], zoom: 3, zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(this.map);
    this.markerLayer = L.layerGroup().addTo(this.map);
  }

  loadFlights() {
    this.loading.set(true);
    this.error.set('');
    this.http.get<RealFlight[]>(`${this.auth.API}/tracker/live`).subscribe({
      next: (data) => {
        this.flights.set(data);
        this.renderMarkers(data);
        this.loading.set(false);
        this.lastUpdated.set(new Date().toLocaleTimeString());
      },
      error: () => {
        this.error.set('Cannot reach backend. Start the backend server and try again.');
        this.loading.set(false);
      },
    });
  }

  private renderMarkers(flights: RealFlight[]) {
    this.markerLayer.clearLayers();
    flights.forEach(f => {
      if (!f.latitude || !f.longitude) return;
      const icon = L.divIcon({
        html: `<div style="transform:rotate(${f.heading ?? 0}deg);font-size:13px;color:#003580;line-height:1;cursor:pointer">✈</div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        className: '',
      });
      const marker = L.marker([f.latitude, f.longitude], { icon });
      marker.bindTooltip(`<b>${f.callsign}</b><br>${f.originCountry}<br>${f.altitude.toLocaleString()} ft · ${f.velocity} kts`, {
        direction: 'top', offset: [0, -8],
      });
      marker.on('click', () => this.selectFlight(f));
      this.markerLayer.addLayer(marker);
    });
  }

  selectFlight(flight: RealFlight) {
    this.selectedFlight.set(flight);
    if (flight.latitude && flight.longitude) {
      this.map.flyTo([flight.latitude, flight.longitude], 8, { duration: 1.2 });
    }
  }

  searchFlight() {
    const q = this.searchQuery.trim().toUpperCase();
    if (!q) return;
    const found = this.flights().find(f => f.callsign?.toUpperCase().includes(q));
    if (found) this.selectFlight(found);
  }

  getDirectionLabel(heading: number): string {
    const dirs = ['N','NE','E','SE','S','SW','W','NW','N'];
    return dirs[Math.round(heading / 45)] ?? '—';
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.map) this.map.remove();
  }
}
