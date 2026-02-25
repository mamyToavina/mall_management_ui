import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PublicBoutiqueDto, PublicBoutiqueProductDto } from '../models/public-catalog.models';
import { PublicCatalogApiService } from '../services/public-catalog-api.service';
import { PublicCartStore } from '../services/public-cart.store';
import { BOUTIQUES, BOUTIQUE_PRODUCTS, PROMO_PRODUCTS } from '../data/public-content.data';

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
  private readonly api = inject(PublicCatalogApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly cart = inject(PublicCartStore);

  readonly boutiqueId = signal(this.route.snapshot.paramMap.get('id') ?? '');
  readonly boutique = signal<PublicBoutiqueDto | null>(null);
  readonly products = signal<PublicBoutiqueProductDto[]>([]);
  readonly loading = signal(true);
  readonly defaultPromotionImage = this.api.defaultPromotionImage;
  readonly defaultBoutiqueLogo = this.api.defaultBoutiqueLogo;
  readonly defaultBoutiqueCover = this.api.defaultBoutiqueCover;

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
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id') ?? '';
      this.boutiqueId.set(id);
      this.loadBoutique(id);
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
    const product = this.products().find((item) => item.id === productId);
    const shop = this.boutique();
    if (!product || !shop) return;

    this.cart.add({
      productId: product.id,
      productName: product.name,
      boutiqueName: shop.name,
      imageUrl: product.imageUrl || this.api.defaultPromotionImage,
      unitPrice: product.promoPrice ?? product.price,
      currency: product.currency
    });
  }

  private loadBoutique(id: string): void {
    if (!id) {
      this.boutique.set(null);
      this.products.set([]);
      return;
    }

    this.loading.set(true);

    this.api
      .getPublicBoutiqueById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const shop = res.data;
          this.boutique.set(shop);
          this.title.setTitle(`TI Commercial | ${shop.name}`);
          this.meta.updateTag({
            name: 'description',
            content: `${shop.name} - ${shop.activity}. ${shop.description}`
          });
          this.loadProducts(id);
        },
        error: () => {
          const fallbackShop = this.toFallbackBoutique(id) || this.toSyntheticBoutiqueFromQuery(id);
          if (!fallbackShop) {
            this.boutique.set(null);
            this.products.set([]);
            this.loading.set(false);
            this.title.setTitle('TI Commercial | Boutique');
            this.meta.updateTag({
              name: 'description',
              content: 'Consultez les details d une boutique TI Commercial.'
            });
            return;
          }

          this.boutique.set(fallbackShop);
          const fallbackProducts = this.toFallbackProducts(id);
          this.products.set(
            fallbackProducts.length
              ? fallbackProducts
              : this.toFallbackProductsByBoutiqueName(fallbackShop.name)
          );
          this.loading.set(false);
          this.title.setTitle(`TI Commercial | ${fallbackShop.name}`);
          this.meta.updateTag({
            name: 'description',
            content: `${fallbackShop.name} - ${fallbackShop.activity}. ${fallbackShop.description}`
          });
        }
      });
  }

  private loadProducts(id: string): void {
    this.api
      .getPublicBoutiqueProducts(id, 100)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.products.set(res.data || []);
          this.loading.set(false);
        },
        error: () => {
          this.products.set(this.toFallbackProducts(id));
          this.loading.set(false);
        }
      });
  }

  private toFallbackBoutique(id: string): PublicBoutiqueDto | null {
    const item = BOUTIQUES.find((shop) => shop.id === id);
    if (!item) return null;
    return {
      id: item.id,
      name: item.name,
      slogan: item.slogan,
      activity: item.activity,
      description: item.description,
      rating: item.rating,
      reviewsCount: item.reviewsCount,
      logoUrl: item.logoUrl,
      coverUrl: item.coverUrl,
      highlights: item.highlights
    };
  }

  private toFallbackProducts(boutiqueId: string): PublicBoutiqueProductDto[] {
    return BOUTIQUE_PRODUCTS.filter((item) => item.boutiqueId === boutiqueId).map((item) => ({
      id: item.id,
      boutiqueId: item.boutiqueId,
      name: item.name,
      category: item.category,
      description: item.description,
      price: item.price,
      promoPrice: item.promoPrice ?? null,
      currency: item.currency,
      imageUrl: item.imageUrl,
      stock: item.stock
    }));
  }

  private toSyntheticBoutiqueFromQuery(id: string): PublicBoutiqueDto | null {
    const qp = this.route.snapshot.queryParamMap;
    const name = (qp.get('bn') || '').trim();
    const activity = (qp.get('ac') || '').trim();
    if (!name) return null;

    return {
      id,
      name,
      slogan: `Bienvenue chez ${name}`,
      activity: activity || 'Boutique partenaire',
      description: 'Decouvrez les offres disponibles dans cette boutique.',
      rating: 0,
      reviewsCount: 0,
      logoUrl: null,
      coverUrl: null,
      highlights: ['Vente en ligne disponible']
    };
  }

  private toFallbackProductsByBoutiqueName(name: string): PublicBoutiqueProductDto[] {
    const normalized = name.trim().toLowerCase();
    if (!normalized) return [];

    const fromStaticCatalog = BOUTIQUE_PRODUCTS.filter((item) => {
      const boutique = BOUTIQUES.find((shop) => shop.id === item.boutiqueId);
      return (boutique?.name || '').trim().toLowerCase() === normalized;
    }).map((item) => ({
      id: item.id,
      boutiqueId: item.boutiqueId,
      name: item.name,
      category: item.category,
      description: item.description,
      price: item.price,
      promoPrice: item.promoPrice ?? null,
      currency: item.currency,
      imageUrl: item.imageUrl,
      stock: item.stock
    }));

    if (fromStaticCatalog.length) return fromStaticCatalog;

    return PROMO_PRODUCTS.filter((item) => item.boutiqueName.trim().toLowerCase() === normalized).map(
      (item) => ({
        id: item.id,
        boutiqueId: item.boutiqueId,
        name: item.name,
        category: item.category,
        description: item.category,
        price: item.originalPrice,
        promoPrice: item.promoPrice,
        currency: item.currency,
        imageUrl: item.imageUrl,
        stock: 0
      })
    );
  }

  onBoutiqueCoverError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img || img.src.endsWith(this.defaultBoutiqueCover)) return;
    img.src = this.defaultBoutiqueCover;
  }

  onBoutiqueLogoError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img || img.src.endsWith(this.defaultBoutiqueLogo)) return;
    img.src = this.defaultBoutiqueLogo;
  }

  onProductImageError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img || img.src.endsWith(this.defaultPromotionImage)) return;
    img.src = this.defaultPromotionImage;
  }
}
