import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { DomSanitizer, Meta, SafeResourceUrl, Title } from '@angular/platform-browser';

import { ActivityPublicDto } from '../../activities/models/activity.models';
import { ActivitiesApiService } from '../../activities/services/activities-api.service';
import { PublicPromotionDto } from '../models/public-catalog.models';
import { PublicCatalogApiService } from '../services/public-catalog-api.service';
import { PublicCartStore } from '../services/public-cart.store';
import { PROMO_PRODUCTS } from '../data/public-content.data';

@Component({
  selector: 'app-public-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './public-home-page.component.html',
  styleUrls: ['./public-home-page.component.css']
})
export class PublicHomePageComponent implements AfterViewInit, OnDestroy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);
  private readonly activitiesApi = inject(ActivitiesApiService);
  private readonly catalogApi = inject(PublicCatalogApiService);

  readonly cart = inject(PublicCartStore);

  @ViewChild('promoTrack') promoTrack?: ElementRef<HTMLDivElement>;
  @ViewChild('eventTrack') eventTrack?: ElementRef<HTMLDivElement>;

  readonly promoProducts = signal<PublicPromotionDto[]>([]);
  readonly loadingPromotions = signal(false);
  readonly events = signal<ActivityPublicDto[]>([]);
  readonly loadingEvents = signal(false);
  readonly defaultPromotionImage = this.catalogApi.defaultPromotionImage;
  readonly defaultActivityImage = '/assets/public-activity-placeholder.svg';
  readonly mapLabel = 'TI Commercial';
  readonly mapLat = -18.9157;
  readonly mapLng = 47.5361;
  readonly mapExternalUrl = `https://www.google.com/maps?q=${this.mapLat},${this.mapLng}`;
  readonly mapZoom = signal(15);
  readonly mapType = signal<'m' | 'k'>('m');

  private rafId: number | null = null;
  private lastFrame = 0;
  private paused = false;
  private readonly dateLongFormatter = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  private readonly dateShortFormatter = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short'
  });

  constructor() {
    this.applySeo();
    this.loadFeaturedPromotions();
    this.loadUpcomingEvents();
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.resumeAutoScroll();
  }

  ngOnDestroy(): void {
    this.stopAutoScroll();
  }

  scrollPromo(direction: 'left' | 'right'): void {
    const node = this.promoTrack?.nativeElement;
    if (!node) return;

    const amount = direction === 'left' ? -340 : 340;
    node.scrollBy({ left: amount, behavior: 'smooth' });
  }

  scrollEvents(direction: 'left' | 'right'): void {
    const node = this.eventTrack?.nativeElement;
    if (!node) return;

    const amount = direction === 'left' ? -340 : 340;
    node.scrollBy({ left: amount, behavior: 'smooth' });
  }

  addPromoToCart(productId: string): void {
    const product = this.promoProducts().find((item) => item.id === productId);
    if (!product) return;

    this.cart.add({
      productId: product.id,
      productName: product.name,
      boutiqueName: product.boutique.name,
      imageUrl: product.imageUrl || this.catalogApi.defaultPromotionImage,
      unitPrice: product.promoPrice,
      currency: product.currency
    });
  }

  pauseAutoScroll(): void {
    this.paused = true;
  }

  resumeAutoScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.paused = false;

    if (this.rafId !== null) return;

    const loop = (timestamp: number) => {
      const node = this.promoTrack?.nativeElement;
      if (!node) {
        this.stopAutoScroll();
        return;
      }

      if (!this.lastFrame) {
        this.lastFrame = timestamp;
      }

      const delta = timestamp - this.lastFrame;
      this.lastFrame = timestamp;

      if (!this.paused) {
        const maxScroll = node.scrollWidth - node.clientWidth;

        if (maxScroll > 0) {
          const next = node.scrollLeft + delta * 0.05;
          if (next >= maxScroll) {
            node.scrollLeft = 0;
          } else {
            node.scrollLeft = next;
          }
        }
      }

      this.rafId = window.requestAnimationFrame(loop);
    };

    this.rafId = window.requestAnimationFrame(loop);
  }

  discountRate(original: number, current: number): number {
    if (!original || original <= current) return 0;
    return Math.round(((original - current) / original) * 100);
  }

  private loadFeaturedPromotions(): void {
    this.loadingPromotions.set(true);
    this.catalogApi
      .getFeaturedPromotions(12)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const items = res.data || [];
          this.promoProducts.set(items.length ? items : this.toFallbackPromotions());
          this.loadingPromotions.set(false);
        },
        error: () => {
          this.promoProducts.set(this.toFallbackPromotions());
          this.loadingPromotions.set(false);
        }
      });
  }

  private toFallbackPromotions(): PublicPromotionDto[] {
    return PROMO_PRODUCTS.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.category,
      category: item.category,
      imageUrl: item.imageUrl,
      currency: item.currency,
      originalPrice: item.originalPrice,
      promoPrice: item.promoPrice,
      discountRate: this.discountRate(item.originalPrice, item.promoPrice),
      boutique: {
        id: item.boutiqueId,
        name: item.boutiqueName,
        logo: null
      }
    }));
  }

  mapSrc(): SafeResourceUrl {
    const q = encodeURIComponent(`${this.mapLat},${this.mapLng} (${this.mapLabel})`);
    const ll = `${this.mapLat},${this.mapLng}`;
    const z = this.mapZoom();
    const t = this.mapType();
    const url = `https://maps.google.com/maps?ll=${ll}&q=${q}&t=${t}&z=${z}&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  setMapType(type: 'm' | 'k'): void {
    this.mapType.set(type);
  }

  zoomInMap(): void {
    this.mapZoom.update((z) => Math.min(20, z + 1));
  }

  zoomOutMap(): void {
    this.mapZoom.update((z) => Math.max(5, z - 1));
  }

  private stopAutoScroll(): void {
    if (this.rafId !== null && isPlatformBrowser(this.platformId)) {
      window.cancelAnimationFrame(this.rafId);
    }

    this.rafId = null;
    this.lastFrame = 0;
  }

  private applySeo(): void {
    this.title.setTitle('TI Commercial | Promotions et activites shopping');

    this.meta.updateTag({
      name: 'description',
      content:
        'Decouvrez les promotions, boutiques et activites publiques de TI Commercial dans une experience moderne.'
    });

    this.meta.updateTag({
      name: 'keywords',
      content: 'TI Commercial, promotions, boutiques, activites, centre commercial, offres'
    });

    this.meta.updateTag({
      property: 'og:title',
      content: 'TI Commercial | Hub public promotions et activites'
    });

    this.meta.updateTag({
      property: 'og:description',
      content: 'Explorez les offres et activites phares de TI Commercial.'
    });
  }

  private loadUpcomingEvents(): void {
    this.loadingEvents.set(true);

    this.activitiesApi
      .getPublicUpcoming({ page: 1, limit: 8 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.events.set(res.data || []);
          this.loadingEvents.set(false);
        },
        error: () => {
          this.events.set([]);
          this.loadingEvents.set(false);
        }
      });
  }

  onEventImageError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img || img.src.endsWith(this.defaultActivityImage)) return;
    img.src = this.defaultActivityImage;
  }

  onPromotionImageError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img || img.src.endsWith(this.defaultPromotionImage)) return;
    img.src = this.defaultPromotionImage;
  }

  activityPeriodLabel(event: ActivityPublicDto): string {
    const start = new Date(event.startDateIso || event.dateIso);
    const end = new Date(event.endDateIso || event.dateIso);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return 'Date a confirmer';
    }

    const sameDay =
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth() &&
      start.getDate() === end.getDate();
    if (sameDay) {
      return `Le ${this.dateLongFormatter.format(start)}`;
    }

    const sameYear = start.getFullYear() === end.getFullYear();
    const sameMonth = sameYear && start.getMonth() === end.getMonth();

    if (sameMonth) {
      return `Du ${start.getDate()} au ${this.dateLongFormatter.format(end)}`;
    }

    if (sameYear) {
      return `Du ${this.dateShortFormatter.format(start)} au ${this.dateLongFormatter.format(end)}`;
    }

    return `Du ${this.dateLongFormatter.format(start)} au ${this.dateLongFormatter.format(end)}`;
  }
}
