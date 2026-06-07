import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home',        loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  { path: 'login',       loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'register',         loadComponent: () => import('./pages/register/register').then(m => m.Register) },
  { path: 'forgot-password', loadComponent: () => import('./pages/forgot-password/forgot-password').then(m => m.ForgotPassword) },
  { path: 'reset-password',  loadComponent: () => import('./pages/reset-password/reset-password').then(m => m.ResetPassword) },
  { path: 'about',       loadComponent: () => import('./pages/about/about').then(m => m.About) },
  { path: 'flights',     loadComponent: () => import('./pages/flights/flights').then(m => m.Flights),     canActivate: [authGuard] },
  { path: 'tracker',     loadComponent: () => import('./pages/tracker/tracker').then(m => m.Tracker),     canActivate: [authGuard] },
  { path: 'my-bookings', loadComponent: () => import('./pages/my-bookings/my-bookings').then(m => m.MyBookings), canActivate: [authGuard] },
  { path: 'cart',        loadComponent: () => import('./pages/cart/cart').then(m => m.Cart),              canActivate: [authGuard] },
  { path: '**', redirectTo: 'home' },
];
