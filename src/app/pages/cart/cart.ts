import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit {
  cartService = inject(CartService);
  private auth   = inject(AuthService);
  private router = inject(Router);

  checkingOut = false;
  successMsg  = '';
  errorMsg    = '';

  ngOnInit() {
    this.cartService.loadCart();
  }

  remove(id: number) {
    this.cartService.removeItem(id).subscribe();
  }

  checkout() {
    this.checkingOut = true;
    this.errorMsg    = '';
    this.cartService.checkout().subscribe({
      next: (res) => {
        this.successMsg  = `All ${res.bookingIds.length} flight(s) booked! Booking IDs: ${res.bookingIds.map(id => '#' + id).join(', ')}`;
        this.checkingOut = false;
      },
      error: () => {
        this.errorMsg    = 'Checkout failed. Is the backend running?';
        this.checkingOut = false;
      },
    });
  }

  goHome() { this.router.navigate(['/home']); }
}
