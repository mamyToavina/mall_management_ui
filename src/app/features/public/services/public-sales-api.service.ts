import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { environment } from '../../../../environments/environment';
import {
  CheckoutPayload,
  MySaleDto,
  SuccessListResponse,
  SuccessResponse
} from '../models/public-sales.models';

@Injectable({ providedIn: 'root' })
export class PublicSalesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/sales`;

  checkout(payload: CheckoutPayload, idempotencyKey?: string) {
    const headers = idempotencyKey
      ? new HttpHeaders({ 'idempotency-key': idempotencyKey })
      : undefined;

    return this.http.post<SuccessResponse<MySaleDto>>(`${this.baseUrl}/checkout`, payload, { headers });
  }

  listMySales(params?: { page?: number; limit?: number }) {
    let query = new HttpParams();
    if (params?.page) query = query.set('page', String(params.page));
    if (params?.limit) query = query.set('limit', String(params.limit));

    return this.http.get<SuccessListResponse<MySaleDto>>(`${this.baseUrl}/my`, { params: query });
  }

  getMySaleById(saleId: string) {
    return this.http.get<SuccessResponse<MySaleDto>>(`${this.baseUrl}/my/${saleId}`);
  }
}

