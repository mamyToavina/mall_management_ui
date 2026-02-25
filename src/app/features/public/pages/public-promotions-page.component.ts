import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PublicCartStore } from '../services/public-cart.store';
import { PublicCatalogApiService } from '../services/public-catalog-api.service';
import { PublicPromotionDto } from '../models/public-catalog.models';

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
  private readonly catalogApi = inject(PublicCatalogApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly cart = inject(PublicCartStore);
  readonly items = signal<PublicPromotionDto[]>([]);
  readonly loading = signal(false);
  readonly defaultPromotionImage = this.catalogApi.defaultPromotionImage;

  constructor() {
    this.title.setTitle('TI Commercial | Promotions publiques');
    this.meta.updateTag({
      name: 'description',
      content: 'Consultez toutes les promotions publiques disponibles dans les boutiques TI Commercial.'
    });

    this.loadPromotions();
  }

  addToCart(productId: string): void {
    const product = this.items().find((item) => item.id === productId);
    if (!product) return;

    this.cart.add({
      productId: product.id,
      productName: product.name,
      boutiqueName: product.boutique.name,
      imageUrl: product.imageUrl || this.defaultPromotionImage,
      unitPrice: product.promoPrice,
      currency: product.currency
    });
  }

  onPromotionImageError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img || img.src.endsWith(this.defaultPromotionImage)) return;
    img.src = this.defaultPromotionImage;
  }

  private loadPromotions(): void {
    this.loading.set(true);
    this.catalogApi
      .getFeaturedPromotions(50)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.items.set(res.data || []);
          this.loading.set(false);
        },
        error: () => {
          this.items.set([]);
          this.loading.set(false);
        }
      });
  }
}
