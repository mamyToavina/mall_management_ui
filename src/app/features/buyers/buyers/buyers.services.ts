import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import {
  UserStatus,
  PaginatedResponse,
  BuyerDto,
  BuyerHistoryFilters,
  BuyerHistoryResponse
} from './buyers.model';
import { environment } from '../../../../environments/environment';

export interface BuyersQuery {
  page: number;
  limit: number;
  search?: string;
  status?: UserStatus | '';
}

@Injectable({ providedIn: 'root' })
export class BuyersApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/users`;

  getBuyers(query: BuyersQuery) {
    let params = new HttpParams()
      .set('page', String(query.page))
      .set('limit', String(query.limit));

    if (query.search?.trim()) params = params.set('search', query.search.trim());
    if (query.status) params = params.set('status', query.status);

    return this.http.get<PaginatedResponse<BuyerDto>>(this.baseUrl, { params }).pipe(
      catchError((err) => throwError(() => err))
    );
  }

  getBuyerById(id: string) {
    return this.http.get<BuyerDto>(`${this.baseUrl}/${id}`);
  }

  getBuyerHistory(id: string, filters: BuyerHistoryFilters = {}) {
    let params = new HttpParams()
      .set('page', String(filters.page ?? 1))
      .set('limit', String(filters.limit ?? 20));

    if (filters.type && filters.type !== 'ALL') params = params.set('type', filters.type);
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    if (typeof filters.minAmount === 'number') params = params.set('minAmount', String(filters.minAmount));
    if (typeof filters.maxAmount === 'number') params = params.set('maxAmount', String(filters.maxAmount));
    if (typeof filters.rating === 'number') params = params.set('rating', String(filters.rating));
    if (filters.search?.trim()) params = params.set('search', filters.search.trim());

    return this.http.get<BuyerHistoryResponse>(`${this.baseUrl}/${id}/history`, { params });
  }

  blockBuyer(id: string, reason: string) {
    return this.http.patch<BuyerDto>(`${this.baseUrl}/${id}/block`, { reason });
  }

  unblockBuyer(id: string) {
    return this.http.patch<BuyerDto>(`${this.baseUrl}/${id}/unblock`, {});
  }
}
