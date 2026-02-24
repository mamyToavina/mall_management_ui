import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import {
  BoutiqueFulfillmentStatus,
  BoutiqueSaleDto,
  PaginationMeta
} from '../models/sales.models';

interface SuccessResponse<T> {
  success: boolean;
  data: T;
}

interface SuccessListResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

@Injectable({ providedIn: 'root' })
export class SalesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/sales`;

  listBoutiqueOrders(params: { page?: number; limit?: number; status?: BoutiqueFulfillmentStatus | '' }) {
    let query = new HttpParams()
      .set('page', String(params.page ?? 1))
      .set('limit', String(params.limit ?? 20));

    if (params.status) {
      query = query.set('status', params.status);
    }

    return this.http.get<SuccessListResponse<BoutiqueSaleDto>>(`${this.baseUrl}/boutique/orders`, {
      params: query
    });
  }

  getBoutiqueOrderById(orderId: string) {
    return this.http.get<SuccessResponse<BoutiqueSaleDto>>(`${this.baseUrl}/boutique/orders/${orderId}`);
  }

  updateBoutiqueOrder(
    orderId: string,
    payload: {
      fulfillmentStatus: BoutiqueFulfillmentStatus;
      fulfillmentNote?: string;
      deliveryDate?: string;
    }
  ) {
    return this.http.patch<SuccessResponse<BoutiqueSaleDto>>(
      `${this.baseUrl}/boutique/orders/${orderId}`,
      payload
    );
  }
}

