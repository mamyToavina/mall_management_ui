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
  PublicPromotionDto,
  PublicPromotionListResponseDto
} from '../models/public-catalog.models';

@Injectable({ providedIn: 'root' })
export class PublicCatalogApiService {
  private readonly http = inject(HttpClient);
  private readonly productsBaseUrl = `${environment.apiBaseUrl}/products/public`;
  private readonly boutiquesBaseUrl = `${environment.apiBaseUrl}/boutiques/public`;
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

  private toAbsoluteImageUrl(value: string | null, fallback: string): string {
    if (!value) return fallback;
    if (/^https?:\/\//i.test(value)) return value;
    return `${this.assetBaseUrl}${value.startsWith('/') ? value : `/${value}`}`;
  }
}
