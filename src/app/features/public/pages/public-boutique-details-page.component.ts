import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthStore } from '../../../core/auth/auth.store';
import { BOUTIQUES, BOUTIQUE_PRODUCTS, PROMO_PRODUCTS } from '../data/public-content.data';
import {
  PublicBoutiqueDto,
  PublicBoutiqueProductDto,
  PublicBoutiqueReviewDto
} from '../models/public-catalog.models';
import { PublicCatalogApiService } from '../services/public-catalog-api.service';
import { PublicCartStore } from '../services/public-cart.store';

@Component({
  selector: 'app-public-boutique-details-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './public-boutique-details-page.component.html',
  styleUrls: ['./public-boutique-details-page.component.css']
})
export class PublicBoutiqueDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly api = inject(PublicCatalogApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authStore = inject(AuthStore);

  readonly cart = inject(PublicCartStore);

  readonly boutiqueId = signal(this.route.snapshot.paramMap.get('id') ?? '');
  readonly boutique = signal<PublicBoutiqueDto | null>(null);
  readonly products = signal<PublicBoutiqueProductDto[]>([]);
  readonly reviews = signal<PublicBoutiqueReviewDto[]>([]);
  readonly loading = signal(true);
  readonly reviewsLoading = signal(false);
  readonly defaultPromotionImage = this.api.defaultPromotionImage;
  readonly defaultBoutiqueLogo = this.api.defaultBoutiqueLogo;
  readonly defaultBoutiqueCover = this.api.defaultBoutiqueCover;
  readonly defaultReviewerAvatar = '/assets/avatar-default-other.svg';
  readonly starScale = [1, 2, 3, 4, 5] as const;

  readonly selectedRating = signal(0);
  readonly reviewMessage = signal('');
  readonly reviewError = signal('');
  readonly reviewSuccess = signal('');
  readonly isSubmittingReview = signal(false);
  readonly isAuthenticated = computed(() => this.authStore.isAuthenticated());
  readonly averageRating = computed(() => Number((this.boutique()?.rating ?? 0).toFixed(1)));

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id') ?? '';
      this.boutiqueId.set(id);
      this.loadBoutique(id);
    });
  }

  setRating(rating: number): void {
    if (!this.isAuthenticated()) return;
    this.selectedRating.set(rating);
  }

  isStarFilled(value: number, star: number): boolean {
    const normalized = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
    return star <= normalized;
  }

  submitReview(): void {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    const id = this.boutiqueId();
    const rating = this.selectedRating();
    const message = this.reviewMessage().trim();
    if (!id || !rating || !message || this.isSubmittingReview()) return;

    this.reviewError.set('');
    this.reviewSuccess.set('');
    this.isSubmittingReview.set(true);

    this.api
      .upsertMyBoutiqueReview(id, { rating, comment: message })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.selectedRating.set(0);
          this.reviewMessage.set('');
          this.reviewSuccess.set('Votre avis a ete publie.');
          this.loadReviews(id);
          this.refreshBoutiqueSummary(id);
          this.isSubmittingReview.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.reviewError.set(err.error?.message || 'Impossible de publier votre avis.');
          this.isSubmittingReview.set(false);
        }
      });
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
      this.reviews.set([]);
      return;
    }

    this.loading.set(true);
    this.reviewError.set('');
    this.reviewSuccess.set('');

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
          this.loadReviews(id);
        },
        error: () => {
          const fallbackShop = this.toFallbackBoutique(id) || this.toSyntheticBoutiqueFromQuery(id);
          if (!fallbackShop) {
            this.boutique.set(null);
            this.products.set([]);
            this.reviews.set([]);
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
          this.reviews.set([]);
          this.loading.set(false);
          this.title.setTitle(`TI Commercial | ${fallbackShop.name}`);
          this.meta.updateTag({
            name: 'description',
            content: `${fallbackShop.name} - ${fallbackShop.activity}. ${fallbackShop.description}`
          });
        }
      });
  }

  private refreshBoutiqueSummary(id: string): void {
    this.api
      .getPublicBoutiqueById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.boutique.set(res.data);
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

  private loadReviews(id: string): void {
    this.reviewsLoading.set(true);
    this.api
      .getPublicBoutiqueReviews(id, 1, 20)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.reviews.set(res.data || []);
          this.reviewsLoading.set(false);
        },
        error: () => {
          this.reviews.set([]);
          this.reviewsLoading.set(false);
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
      boxNumber: null,
      boxFloor: null,
      offerings: item.description,
      marketingTagline: item.slogan,
      locationDescription: `Retrouvez-nous dans TI Commercial, espace ${item.name}.`,
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
      boxNumber: null,
      boxFloor: null,
      offerings: `Nous proposons une selection de produits ${activity || 'pour votre quotidien'}.`,
      marketingTagline: 'Profitez de nos meilleures offres en boutique et en ligne.',
      locationDescription: `Bienvenue chez ${name}, retrouvez-nous dans TI Commercial.`,
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

  onReviewerAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img || img.src.endsWith(this.defaultReviewerAvatar)) return;
    img.src = this.defaultReviewerAvatar;
  }

  boxFloorLabel(floor: number | null): string {
    if (floor === null || floor === undefined) return '';
    if (floor === 0) return 'rez-de-chaussee';
    if (floor === 1) return '1er etage';
    return `${floor}e etage`;
  }
}
