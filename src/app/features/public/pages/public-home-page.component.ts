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
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { DomSanitizer, Meta, SafeResourceUrl, Title } from '@angular/platform-browser';

import { ActivityPublicDto } from '../../activities/models/activity.models';
import { ActivitiesApiService } from '../../activities/services/activities-api.service';
import { PROMO_PRODUCTS } from '../data/public-content.data';
import { PublicCartStore } from '../services/public-cart.store';

@Component({
  selector: 'app-public-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
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

  readonly cart = inject(PublicCartStore);

  @ViewChild('promoTrack') promoTrack?: ElementRef<HTMLDivElement>;

  readonly promoProducts = PROMO_PRODUCTS;
  readonly events = signal<ActivityPublicDto[]>([]);
  readonly loadingEvents = signal(false);
  readonly defaultActivityImage = '/assets/activity-placeholder.svg';
  readonly mapLabel = 'TI Commercial';
  readonly mapLat = -18.9157;
  readonly mapLng = 47.5361;
  readonly mapExternalUrl = `https://www.google.com/maps?q=${this.mapLat},${this.mapLng}`;
  readonly mapZoom = signal(15);
  readonly mapType = signal<'m' | 'k'>('m');

  private rafId: number | null = null;
  private lastFrame = 0;
  private paused = false;

  constructor() {
    this.applySeo();
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

  addPromoToCart(productId: string): void {
    const product = this.promoProducts.find((item) => item.id === productId);
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
      .getPublicUpcoming(8)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          this.events.set(items);
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
}
