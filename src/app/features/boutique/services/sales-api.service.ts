import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import {
  BoutiqueFulfillmentStatus,
  BoutiqueSaleDto,
  DeliveryCapacityCalendarDto,
  DeliverySettingsResponseDto,
  PaginationMeta
} from '../models/sales.models';
import { BoutiqueDashboardDto } from '../models/dashboard.models';

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

  getDeliverySettings() {
    return this.http.get<SuccessResponse<DeliverySettingsResponseDto>>(
      `${this.baseUrl}/boutique/delivery-settings`
    );
  }

  updateDeliverySettings(payload: {
    workingDays: number[];
    dailyOrderCapacity: number;
    preparationDays: number;
  }) {
    return this.http.patch<SuccessResponse<DeliverySettingsResponseDto>>(
      `${this.baseUrl}/boutique/delivery-settings`,
      payload
    );
  }

  getDeliveryCapacityCalendar(params?: { from?: string; to?: string }) {
    let query = new HttpParams();
    if (params?.from) query = query.set('from', params.from);
    if (params?.to) query = query.set('to', params.to);

    return this.http.get<SuccessResponse<DeliveryCapacityCalendarDto>>(
      `${this.baseUrl}/boutique/delivery-capacity`,
      { params: query }
    );
  }

  getBoutiqueDashboard(days = 30) {
    const params = new HttpParams().set('days', String(days));
    return this.http.get<SuccessResponse<BoutiqueDashboardDto>>(`${this.baseUrl}/boutique/dashboard`, {
      params
    });
  }
}
