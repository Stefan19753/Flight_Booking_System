import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  readonly API = environment.apiUrl;

  private readonly TOKEN_KEY = 'fbs_token';
  private readonly USER_KEY  = 'fbs_user';

  currentUser = signal<User | null>(this.loadUser());
  token       = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));

  private loadUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  register(firstName: string, lastName: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.API}/auth/register`, { firstName, lastName, email, password });
  }

  login(email: string, password: string): Observable<{ token: string; user: User }> {
    return this.http.post<{ token: string; user: User }>(`${this.API}/auth/login`, { email, password }).pipe(
      tap(res => {
        this.token.set(res.token);
        this.currentUser.set(res.user);
        localStorage.setItem(this.TOKEN_KEY, res.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
      })
    );
  }

  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null && this.token() !== null;
  }

  authHeaders(): { [h: string]: string } {
    return { Authorization: `Bearer ${this.token() ?? ''}` };
  }
}
