import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PublicBoutiqueDto, PublicPromotionDto } from '../models/public-catalog.models';
import { PublicCatalogApiService } from '../services/public-catalog-api.service';

@Component({
  selector: 'app-public-search-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './public-search-page.component.html',
  styleUrls: ['./public-search-page.component.css']
})
export class PublicSearchPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PublicCatalogApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly query = signal('');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly promotions = signal<PublicPromotionDto[]>([]);
  readonly boutiques = signal<PublicBoutiqueDto[]>([]);
  readonly defaultPromotionImage = this.api.defaultPromotionImage;
  readonly defaultBoutiqueLogo = this.api.defaultBoutiqueLogo;

  constructor() {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const q = String(params['q'] || '').trim();
      this.query.set(q);
      this.search(q);
    });
  }

  private search(q: string): void {
    if (!q) {
      this.promotions.set([]);
      this.boutiques.set([]);
      this.error.set('');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.api
      .searchPublic({ type: 'ALL', query: q, limit: 12 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.promotions.set(res?.promotions?.data || []);
          this.boutiques.set(res?.boutiques?.data || []);
          this.loading.set(false);
        },
        error: () => {
          this.promotions.set([]);
          this.boutiques.set([]);
          this.loading.set(false);
          this.error.set('Recherche impossible pour le moment.');
        }
      });
  }
}
