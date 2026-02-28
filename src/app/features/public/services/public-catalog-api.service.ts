import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  PublicBoutiqueDetailResponseDto,
  PublicBoutiqueDto,
  PublicBoutiqueListResponseDto,
  PublicBoutiqueProductDto,
  PublicBoutiqueProductsResponseDto,
  PublicGeneralSettingsDto,
  PublicBoutiqueReviewDto,
  PublicBoutiqueReviewListResponseDto,
  PublicPromotionDto,
  PublicPromotionListResponseDto,
  UpsertMyBoutiqueReviewPayload,
  UpsertMyBoutiqueReviewResponseDto
} from '../models/public-catalog.models';

@Injectable({ providedIn: 'root' })
export class PublicCatalogApiService {
  private readonly http = inject(HttpClient);
  private readonly productsBaseUrl = `${environment.apiBaseUrl}/products/public`;
  private readonly boutiquesBaseUrl = `${environment.apiBaseUrl}/boutiques/public`;
  private readonly reviewsBaseUrl = `${environment.apiBaseUrl}/reviews`;
  private readonly settingsBaseUrl = `${environment.apiBaseUrl}/settings`;
  private readonly assetBaseUrl = environment.apiBaseUrl.replace(/\/api\/?$/, '');
  readonly defaultPromotionImage = '/assets/public-product-placeholder.svg';
  readonly defaultBoutiqueLogo = '/assets/public-boutique-logo-placeholder.svg';
  readonly defaultBoutiqueCover = '/assets/public-boutique-cover-placeholder.svg';

  getFeaturedPromotions(limit = 12) {
    const params = new HttpParams().set('limit', String(limit));
    return this.http
      .get<PublicPromotionListResponseDto>(`${this.productsBaseUrl}/promotions`, { params })
      .pipe(
        map((res) => ({
          ...res,
          data: (res.data || []).map((item) => this.normalizePromotion(item))
        }))
      );
  }

  searchPublic(params: {
    type?: 'PROMO' | 'BOUTIQUE' | 'ALL';
    query?: string;
    category?: string;
    minPrice?: number | null;
    maxPrice?: number | null;
    minRating?: number | null;
    limit?: number;
  }) {
    let httpParams = new HttpParams();
    if (params.type) httpParams = httpParams.set('type', params.type);
    if (params.query) httpParams = httpParams.set('query', params.query);
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.minPrice !== null && params.minPrice !== undefined) {
      httpParams = httpParams.set('minPrice', String(params.minPrice));
    }
    if (params.maxPrice !== null && params.maxPrice !== undefined) {
      httpParams = httpParams.set('maxPrice', String(params.maxPrice));
    }
    if (params.minRating !== null && params.minRating !== undefined) {
      httpParams = httpParams.set('minRating', String(params.minRating));
    }
    if (params.limit) httpParams = httpParams.set('limit', String(params.limit));

    return this.http.get<{
      promotions: PublicPromotionListResponseDto;
      boutiques: PublicBoutiqueListResponseDto;
    }>(`${environment.apiBaseUrl}/public/search`, { params: httpParams }).pipe(
      map((res) => ({
        promotions: {
          ...res.promotions,
          data: (res.promotions?.data || []).map((item) => this.normalizePromotion(item))
        },
        boutiques: {
          ...res.boutiques,
          data: (res.boutiques?.data || []).map((item) => this.normalizeBoutique(item))
        }
      }))
    );
  }

  getPublicBoutiques(limit = 24) {
    const params = new HttpParams().set('limit', String(limit));
    return this.http
      .get<PublicBoutiqueListResponseDto>(this.boutiquesBaseUrl, { params })
      .pipe(
        map((res) => ({
          ...res,
          data: (res.data || []).map((item) => this.normalizeBoutique(item))
        }))
      );
  }

  getPublicBoutiqueById(id: string) {
    return this.http
      .get<PublicBoutiqueDetailResponseDto>(`${this.boutiquesBaseUrl}/${id}`)
      .pipe(
        map((res) => ({
          ...res,
          data: this.normalizeBoutique(res.data)
        }))
      );
  }

  getPublicBoutiqueProducts(id: string, limit = 100) {
    const params = new HttpParams().set('limit', String(limit));
    return this.http
      .get<PublicBoutiqueProductsResponseDto>(`${this.boutiquesBaseUrl}/${id}/products`, { params })
      .pipe(
        map((res) => ({
          ...res,
          data: (res.data || []).map((item) => this.normalizeBoutiqueProduct(item))
        }))
      );
  }

  getPublicGeneralSettings() {
    return this.http.get<PublicGeneralSettingsDto>(`${this.settingsBaseUrl}/public`);
  }

  getPublicBoutiqueReviews(id: string, page = 1, limit = 20) {
    const params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    return this.http
      .get<PublicBoutiqueReviewListResponseDto>(`${this.reviewsBaseUrl}/boutiques/${id}`, { params })
      .pipe(
        map((res) => ({
          ...res,
          data: (res.data || []).map((item) => this.normalizeBoutiqueReview(item))
        }))
      );
  }

  upsertMyBoutiqueReview(id: string, payload: UpsertMyBoutiqueReviewPayload) {
    return this.http.post<UpsertMyBoutiqueReviewResponseDto>(
      `${this.reviewsBaseUrl}/boutiques/${id}`,
      payload
    );
  }

  private normalizePromotion(item: PublicPromotionDto): PublicPromotionDto {
    return {
      ...item,
      imageUrl: this.toAbsoluteImageUrl(item.imageUrl, this.defaultPromotionImage),
      originalPrice: Number(item.originalPrice) || 0,
      promoPrice: Number(item.promoPrice) || 0,
      discountRate: Number(item.discountRate) || 0
    };
  }

  private normalizeBoutique(item: PublicBoutiqueDto): PublicBoutiqueDto {
    return {
      ...item,
      activity: item.activity || 'Boutique partenaire',
      boxNumber: item.boxNumber || null,
      boxFloor: Number.isFinite(Number(item.boxFloor)) ? Number(item.boxFloor) : null,
      offerings: item.offerings || '',
      marketingTagline: item.marketingTagline || '',
      locationDescription: item.locationDescription || '',
      description: item.description || '',
      logoUrl: this.toAbsoluteImageUrl(item.logoUrl, this.defaultBoutiqueLogo),
      coverUrl: this.toAbsoluteImageUrl(item.coverUrl, this.defaultBoutiqueCover),
      highlights: Array.isArray(item.highlights) ? item.highlights : []
    };
  }

  private normalizeBoutiqueProduct(item: PublicBoutiqueProductDto): PublicBoutiqueProductDto {
    return {
      ...item,
      imageUrl: this.toAbsoluteImageUrl(item.imageUrl, this.defaultPromotionImage),
      price: Number(item.price) || 0,
      promoPrice: item.promoPrice === null || item.promoPrice === undefined ? null : Number(item.promoPrice),
      stock: Number(item.stock) || 0
    };
  }

  private normalizeBoutiqueReview(item: PublicBoutiqueReviewDto): PublicBoutiqueReviewDto {
    return {
      ...item,
      rating: Number(item.rating) || 0,
      comment: item.comment || '',
      author: {
        id: item.author?.id ?? null,
        pseudo: item.author?.pseudo || 'Utilisateur',
        avatar: this.toAbsoluteImageUrl(item.author?.avatar || null, '/assets/avatar-default-other.svg')
      }
    };
  }

  private toAbsoluteImageUrl(value: string | null, fallback: string): string {
    if (!value) return fallback;
    if (/^https?:\/\//i.test(value)) return value;
    return `${this.assetBaseUrl}${value.startsWith('/') ? value : `/${value}`}`;
  }
}
