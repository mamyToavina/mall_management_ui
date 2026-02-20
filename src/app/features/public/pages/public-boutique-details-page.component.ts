import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

import { BOUTIQUES, BOUTIQUE_PRODUCTS } from '../data/public-content.data';
import { PublicCartStore } from '../services/public-cart.store';

type BoutiqueReview = {
  author: string;
  rating: number;
  message: string;
  createdAt: string;
};

@Component({
  selector: 'app-public-boutique-details-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './public-boutique-details-page.component.html',
  styleUrls: ['./public-boutique-details-page.component.css']
})
export class PublicBoutiqueDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly cart = inject(PublicCartStore);

  readonly boutiqueId = signal(this.route.snapshot.paramMap.get('id') ?? '');
  readonly boutiques = BOUTIQUES;
  readonly productsCatalog = BOUTIQUE_PRODUCTS;

  readonly boutique = computed(() =>
    this.boutiques.find((item) => item.id === this.boutiqueId()) ?? null
  );

  readonly products = computed(() =>
    this.productsCatalog.filter((item) => item.boutiqueId === this.boutiqueId())
  );

  readonly reviews = signal<BoutiqueReview[]>([
    {
      author: 'Sonia R.',
      rating: 5,
      message: 'Equipe tres pro, tres bon accueil et produits conformes.',
      createdAt: '2026-02-10'
    },
    {
      author: 'Mickael T.',
      rating: 4,
      message: 'Belle qualite de service, je recommande pour les promos du week-end.',
      createdAt: '2026-02-05'
    }
  ]);

  readonly selectedRating = signal(0);
  readonly reviewAuthor = signal('');
  readonly reviewMessage = signal('');

  readonly averageRating = computed(() => {
    const current = this.boutique()?.rating ?? 0;
    const local = this.reviews();

    if (!local.length) return current;

    const total = local.reduce((acc, review) => acc + review.rating, current);
    return Number((total / (local.length + 1)).toFixed(1));
  });

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id') ?? '';
      this.boutiqueId.set(id);
      const shop = this.boutiques.find((item) => item.id === id);

      this.title.setTitle(
        shop ? `TI Commercial | ${shop.name}` : 'TI Commercial | Boutique'
      );

      this.meta.updateTag({
        name: 'description',
        content: shop
          ? `${shop.name} - ${shop.activity}. ${shop.description}`
          : 'Consultez les details d une boutique TI Commercial.'
      });
    });
  }

  setRating(rating: number): void {
    this.selectedRating.set(rating);
  }

  submitReview(): void {
    const rating = this.selectedRating();
    const author = this.reviewAuthor().trim();
    const message = this.reviewMessage().trim();

    if (!rating || !author || !message) return;

    this.reviews.update((current) => [
      {
        author,
        rating,
        message,
        createdAt: new Date().toISOString().slice(0, 10)
      },
      ...current
    ]);

    this.selectedRating.set(0);
    this.reviewAuthor.set('');
    this.reviewMessage.set('');
  }

  addToCart(productId: string): void {
    const product = this.productsCatalog.find((item) => item.id === productId);
    const shop = this.boutique();
    if (!product || !shop) return;

    this.cart.add({
      productId: product.id,
      productName: product.name,
      boutiqueName: shop.name,
      imageUrl: product.imageUrl,
      unitPrice: product.promoPrice ?? product.price,
      currency: product.currency
    });
  }
}
