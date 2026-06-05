import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  auth        = inject(AuthService);
  cartService = inject(CartService);
  private router = inject(Router);

  ngOnInit() {
    if (this.auth.isLoggedIn()) this.cartService.loadCart();
  }

  logout() {
    this.auth.logout();
    this.cartService.items.set([]);
    this.router.navigate(['/home']);
  }
}
