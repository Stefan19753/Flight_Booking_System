import { Injectable } from '@angular/core';

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  origin: Airport;
  destination: Airport;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  seatsAvailable: number;
  stops: number;
}

export interface Booking {
  id: string;
  userId: string;
  flight: Flight;
  passengers: number;
  totalPrice: number;
  bookedAt: string;
  status: 'confirmed' | 'cancelled';
  seat: string;
}

export interface LiveFlight {
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  originCode: string;
  destinationCode: string;
  status: 'in-air' | 'on-time' | 'boarding' | 'delayed' | 'landed';
  departureTime: string;
  arrivalTime: string;
  altitude: number;
  speed: number;
  progress: number;
}

@Injectable({ providedIn: 'root' })
export class FlightService {
  private readonly BOOKINGS_KEY = 'fbs_bookings';

  private airports: Airport[] = [
    { code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York', country: 'USA' },
    { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'UK' },
    { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France' },
    { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' },
    { code: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'Japan' },
    { code: 'SYD', name: 'Sydney Airport', city: 'Sydney', country: 'Australia' },
    { code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles', country: 'USA' },
    { code: 'ORD', name: "O'Hare International", city: 'Chicago', country: 'USA' },
    { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
    { code: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'Singapore' },
    { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands' },
    { code: 'MIA', name: 'Miami International', city: 'Miami', country: 'USA' },
    { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand' },
    { code: 'BCN', name: 'El Prat Airport', city: 'Barcelona', country: 'Spain' },
    { code: 'OTP', name: 'Henri Coanda Intl', city: 'Bucharest', country: 'Romania' },
  ];

  getAirports(): Airport[] {
    return this.airports;
  }

  searchFlights(originCode: string, destCode: string, _date: string, passengers: number): Flight[] {
    const origin = this.airports.find(a => a.code === originCode);
    const destination = this.airports.find(a => a.code === destCode);
    if (!origin || !destination || originCode === destCode) return [];

    const airlines = [
      { name: 'SkyWings Airlines', code: 'SW' },
      { name: 'Atlantic Air', code: 'AA' },
      { name: 'Pacific Express', code: 'PE' },
      { name: 'Global Wings', code: 'GW' },
      { name: 'Blue Horizon', code: 'BH' },
    ];

    const seed = (originCode.charCodeAt(0) + destCode.charCodeAt(0)) % 200;
    const basePrice = seed + 150;

    const slots = [
      { dep: '06:30', arr: '09:45', dur: '3h 15m', priceMod: 0 },
      { dep: '10:15', arr: '14:20', dur: '4h 05m', priceMod: 50 },
      { dep: '13:00', arr: '17:30', dur: '4h 30m', priceMod: -30, stops: 1 },
      { dep: '16:45', arr: '21:00', dur: '4h 15m', priceMod: 80 },
      { dep: '20:00', arr: '23:55', dur: '3h 55m', priceMod: 20 },
    ];

    return slots.map((s, i) => {
      const airline = airlines[i % airlines.length];
      return {
        id: `${originCode}-${destCode}-${i}`,
        flightNumber: `${airline.code}${1000 + i * 111}`,
        airline: airline.name,
        origin,
        destination,
        departureTime: s.dep,
        arrivalTime: s.arr,
        duration: s.dur,
        price: (basePrice + s.priceMod) * passengers,
        seatsAvailable: 5 + (i * 7) % 45,
        stops: (s as any).stops ?? 0,
      };
    });
  }

  getLiveFlights(): LiveFlight[] {
    return [
      { flightNumber: 'SW1234', airline: 'SkyWings Airlines', origin: 'New York', destination: 'London', originCode: 'JFK', destinationCode: 'LHR', status: 'in-air', departureTime: '08:30', arrivalTime: '20:45', altitude: 35000, speed: 547, progress: 65 },
      { flightNumber: 'AA5678', airline: 'Atlantic Air', origin: 'Paris', destination: 'Dubai', originCode: 'CDG', destinationCode: 'DXB', status: 'in-air', departureTime: '10:15', arrivalTime: '18:30', altitude: 38000, speed: 563, progress: 42 },
      { flightNumber: 'PE3421', airline: 'Pacific Express', origin: 'Dubai', destination: 'Tokyo', originCode: 'DXB', destinationCode: 'NRT', status: 'in-air', departureTime: '14:00', arrivalTime: '26:30', altitude: 36000, speed: 589, progress: 28 },
      { flightNumber: 'GW7890', airline: 'Global Wings', origin: 'Los Angeles', destination: 'Sydney', originCode: 'LAX', destinationCode: 'SYD', status: 'in-air', departureTime: '23:55', arrivalTime: '09:30', altitude: 37500, speed: 521, progress: 78 },
      { flightNumber: 'BH2100', airline: 'Blue Horizon', origin: 'London', destination: 'New York', originCode: 'LHR', destinationCode: 'JFK', status: 'on-time', departureTime: '11:00', arrivalTime: '14:30', altitude: 0, speed: 0, progress: 0 },
      { flightNumber: 'SW4567', airline: 'SkyWings Airlines', origin: 'Tokyo', destination: 'Singapore', originCode: 'NRT', destinationCode: 'SIN', status: 'boarding', departureTime: '15:45', arrivalTime: '21:20', altitude: 0, speed: 0, progress: 0 },
      { flightNumber: 'AA8901', airline: 'Atlantic Air', origin: 'Frankfurt', destination: 'Chicago', originCode: 'FRA', destinationCode: 'ORD', status: 'delayed', departureTime: '12:30', arrivalTime: '15:00', altitude: 0, speed: 0, progress: 0 },
      { flightNumber: 'PE6543', airline: 'Pacific Express', origin: 'Miami', destination: 'Barcelona', originCode: 'MIA', destinationCode: 'BCN', status: 'landed', departureTime: '21:00', arrivalTime: '11:00', altitude: 0, speed: 0, progress: 100 },
    ];
  }

  bookFlight(userId: string, flight: Flight, passengers: number): Booking {
    const bookings = this.getBookings();
    const seats = ['12A', '14C', '22B', '31F', '8D', '5A', '18E', '25C'];
    const booking: Booking = {
      id: Date.now().toString(),
      userId,
      flight,
      passengers,
      totalPrice: flight.price,
      bookedAt: new Date().toISOString(),
      status: 'confirmed',
      seat: seats[Math.floor(Math.random() * seats.length)],
    };
    bookings.push(booking);
    localStorage.setItem(this.BOOKINGS_KEY, JSON.stringify(bookings));
    return booking;
  }

  getBookings(): Booking[] {
    const data = localStorage.getItem(this.BOOKINGS_KEY);
    return data ? JSON.parse(data) : [];
  }

  getUserBookings(userId: string): Booking[] {
    return this.getBookings().filter(b => b.userId === userId);
  }

  cancelBooking(bookingId: string): void {
    const bookings = this.getBookings();
    const b = bookings.find(b => b.id === bookingId);
    if (b) {
      b.status = 'cancelled';
      localStorage.setItem(this.BOOKINGS_KEY, JSON.stringify(bookings));
    }
  }
}
