import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import {
  PaginatedResponse,
  ProductCatalogQuery,
  ProductDto,
  StockMovementDto,
  StockOperation
} from '../models/product.models';

@Injectable({ providedIn: 'root' })
export class ProductsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/products`;

  listMine(query: ProductCatalogQuery) {
    let params = new HttpParams()
      .set('page', String(query.page))
      .set('limit', String(query.limit));

    if (query.search?.trim()) {
      params = params.set('search', query.search.trim());
    }

    if (query.status) {
      params = params.set('status', query.status);
    }

    if (query.category?.trim()) {
      params = params.set('category', query.category.trim());
    }

    if (query.lowStock !== undefined) {
      params = params.set('lowStock', String(query.lowStock));
    }

    return this.http.get<PaginatedResponse<ProductDto>>(this.baseUrl, { params });
  }

  createMine(formData: FormData) {
    return this.http.post<ProductDto>(this.baseUrl, formData);
  }

  getMineById(productId: string) {
    return this.http.get<ProductDto>(`${this.baseUrl}/${productId}`);
  }

  listStockMovements(productId: string, page = 1, limit = 20) {
    const params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    return this.http.get<PaginatedResponse<StockMovementDto>>(
      `${this.baseUrl}/${productId}/stock-movements`,
      { params }
    );
  }

  adjustStock(
    productId: string,
    payload: {
      operation: StockOperation;
      quantity: number;
      reason?: string;
      note?: string;
      reference?: string;
    }
  ) {
    return this.http.patch<ProductDto>(`${this.baseUrl}/${productId}/stock`, payload);
  }
}
