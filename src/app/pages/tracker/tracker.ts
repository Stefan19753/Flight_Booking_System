import { Component, inject, OnDestroy, AfterViewInit, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { environment } from '../../../environments/environment';

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
    const headers = environment.openskyUsername
      ? new HttpHeaders({ Authorization: 'Basic ' + btoa(`${environment.openskyUsername}:${environment.openskyPassword}`) })
      : new HttpHeaders();
    this.http.get<any>('https://opensky-network.org/api/states/all', { headers }).subscribe({
      next: (resp) => {
        const states: any[] = resp.states ?? [];
        const flights: RealFlight[] = states
          .filter((s: any) => s[1]?.trim() && s[5] !== null && s[6] !== null && !s[8])
          .slice(0, 300)
          .map((s: any) => ({
            icao24:        s[0],
            callsign:      s[1].trim(),
            originCountry: s[2],
            longitude:     s[5],
            latitude:      s[6],
            altitude:      s[7] ? Math.round(s[7] * 3.281) : 0,
            onGround:      s[8],
            velocity:      s[9] ? Math.round(s[9] * 1.944) : 0,
            heading:       s[10] ?? 0,
            verticalRate:  s[11] ?? 0,
          }));
        this.flights.set(flights);
        this.renderMarkers(flights);
        this.loading.set(false);
        this.lastUpdated.set(new Date().toLocaleTimeString());
      },
      error: () => {
        this.error.set('Could not load live flights. Please try again shortly.');
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
