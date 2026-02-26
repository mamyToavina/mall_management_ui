import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PublicBoutiqueDto } from '../models/public-catalog.models';
import { PublicCatalogApiService } from '../services/public-catalog-api.service';
import { BOUTIQUES } from '../data/public-content.data';

@Component({
  selector: 'app-public-boutiques-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './public-boutiques-page.component.html',
  styleUrls: ['./public-boutiques-page.component.css']
})
export class PublicBoutiquesPageComponent {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly api = inject(PublicCatalogApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly boutiques = signal<PublicBoutiqueDto[]>([]);
  readonly loading = signal(false);
  readonly defaultBoutiqueLogo = this.api.defaultBoutiqueLogo;
  readonly defaultBoutiqueCover = this.api.defaultBoutiqueCover;
  readonly starScale = [1, 2, 3, 4, 5] as const;

  constructor() {
    this.title.setTitle('TI Commercial | Boutiques');
    this.meta.updateTag({
      name: 'description',
      content: 'Explorez les boutiques de TI Commercial, leurs activites et leurs offres phares.'
    });

    this.loadBoutiques();
  }

  private loadBoutiques() {
    this.loading.set(true);
    this.api
      .getPublicBoutiques(50)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const items = res.data || [];
          this.boutiques.set(items.length ? items : this.toFallbackBoutiques());
          this.loading.set(false);
        },
        error: () => {
          this.boutiques.set(this.toFallbackBoutiques());
          this.loading.set(false);
        }
      });
  }

  private toFallbackBoutiques(): PublicBoutiqueDto[] {
    return BOUTIQUES.map((item) => ({
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
    }));
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

  boxFloorLabel(floor: number | null): string {
    if (floor === null || floor === undefined) return '';
    if (floor === 0) return 'rez-de-chaussee';
    if (floor === 1) return '1er etage';
    return `${floor}e etage`;
  }

  isStarFilled(value: number, star: number): boolean {
    const normalized = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
    return star <= normalized;
  }
}
