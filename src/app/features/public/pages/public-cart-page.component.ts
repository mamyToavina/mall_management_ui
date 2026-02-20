import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { PublicCartStore } from '../services/public-cart.store';

@Component({
  selector: 'app-public-cart-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './public-cart-page.component.html',
  styleUrls: ['./public-cart-page.component.css']
})
export class PublicCartPageComponent {
  readonly cart = inject(PublicCartStore);

  removeItem(productId: string): void {
    this.cart.remove(productId);
  }

  clearCart(): void {
    this.cart.clear();
  }
}
