import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

import { PROMO_PRODUCTS } from '../data/public-content.data';
import { PublicCartStore } from '../services/public-cart.store';

@Component({
  selector: 'app-public-promotions-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './public-promotions-page.component.html',
  styleUrls: ['./public-promotions-page.component.css']
})
export class PublicPromotionsPageComponent {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly cart = inject(PublicCartStore);
  readonly items = PROMO_PRODUCTS;

  constructor() {
    this.title.setTitle('TI Commercial | Promotions publiques');
    this.meta.updateTag({
      name: 'description',
      content: 'Consultez toutes les promotions publiques disponibles dans les boutiques TI Commercial.'
    });
  }

  addToCart(productId: string): void {
    const product = this.items.find((item) => item.id === productId);
    if (!product) return;

    this.cart.add({
      productId: product.id,
      productName: product.name,
      boutiqueName: product.boutiqueName,
      imageUrl: product.imageUrl,
      unitPrice: product.promoPrice,
      currency: product.currency
    });
  }
}

