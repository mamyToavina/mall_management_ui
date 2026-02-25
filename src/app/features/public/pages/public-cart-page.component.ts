import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { PublicCartStore } from '../services/public-cart.store';
import { PublicCatalogApiService } from '../services/public-catalog-api.service';

@Component({
  selector: 'app-public-cart-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './public-cart-page.component.html',
  styleUrls: ['./public-cart-page.component.css']
})
export class PublicCartPageComponent {
  readonly cart = inject(PublicCartStore);
  private readonly catalogApi = inject(PublicCatalogApiService);
  readonly defaultPromotionImage = this.catalogApi.defaultPromotionImage;

  removeItem(productId: string): void {
    this.cart.remove(productId);
  }

  clearCart(): void {
    this.cart.clear();
  }

  onCartImageError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img || img.src.endsWith(this.defaultPromotionImage)) return;
    img.src = this.defaultPromotionImage;
  }
}
