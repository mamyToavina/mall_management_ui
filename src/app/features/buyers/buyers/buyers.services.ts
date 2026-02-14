/*import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UserStatus, PaginatedResponse, BuyerDto } from './buyers.model';

export interface BuyersQuery {
  page: number;
  limit: number;
  search?: string;
  status?: UserStatus | '';
}

@Injectable({ providedIn: 'root' })
export class BuyersApiService {
  private http = inject(HttpClient);

  private readonly baseUrl = 'http://localhost:7878/api/users';

  getBuyers(query: BuyersQuery) {
    let params = new HttpParams()
      .set('page', String(query.page))
      .set('limit', String(query.limit));

    if (query.search?.trim()) params = params.set('search', query.search.trim());
    if (query.status) params = params.set('status', query.status);

    return this.http.get<PaginatedResponse<BuyerDto>>(this.baseUrl, { params });
  }

  getBuyerById(id: string) {
    return this.http.get<BuyerDto>(`${this.baseUrl}/${id}`);
  }

  blockBuyer(id: string) {
    return this.http.patch<BuyerDto>(`${this.baseUrl}/${id}/block`, {});
  }

  unblockBuyer(id: string) {
    return this.http.patch<BuyerDto>(`${this.baseUrl}/${id}/unblock`, {});
  }
}*/

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { tap, catchError, throwError } from 'rxjs';
import { UserStatus, PaginatedResponse, BuyerDto } from './buyers.model';

export interface BuyersQuery {
  page: number;
  limit: number;
  search?: string;
  status?: UserStatus | '';
}

@Injectable({ providedIn: 'root' })
export class BuyersApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:7878/api/users';

  getBuyers(query: BuyersQuery) {
    let params = new HttpParams()
      .set('page', String(query.page))
      .set('limit', String(query.limit));

    if (query.search?.trim()) params = params.set('search', query.search.trim());
    if (query.status) params = params.set('status', query.status);

    // ✅ DEBUG: voir exactement l'URL finale avec query params
    const urlWithParams = `${this.baseUrl}?${params.toString()}`;
    console.log('[BuyersApiService.getBuyers] GET', urlWithParams);

    return this.http.get<PaginatedResponse<BuyerDto>>(this.baseUrl, { params }).pipe(
      tap((res) => {
        console.log('[BuyersApiService.getBuyers] RAW RESPONSE:', res);

        // ✅ utile si PaginatedResponse = { data: BuyerDto[], ... }
        const anyRes = res as any;
        if (anyRes?.data && Array.isArray(anyRes.data)) {
          console.log('[BuyersApiService.getBuyers] data length:', anyRes.data.length);
          console.table(anyRes.data);
        } else {
          console.warn(
            '[BuyersApiService.getBuyers] Response shape is not { data: [] }. Check backend contract.',
            anyRes
          );
        }
      }),
      catchError((err) => {
        console.error('[BuyersApiService.getBuyers] ERROR:', err);
        // très utile pour voir message backend
        console.error('[BuyersApiService.getBuyers] ERROR status:', err?.status);
        console.error('[BuyersApiService.getBuyers] ERROR body:', err?.error);
        return throwError(() => err);
      })
    );
  }

  getBuyerById(id: string) {
    console.log('[BuyersApiService.getBuyerById] GET', `${this.baseUrl}/${id}`);
    return this.http.get<BuyerDto>(`${this.baseUrl}/${id}`);
  }

  blockBuyer(id: string) {
    console.log('[BuyersApiService.blockBuyer] PATCH', `${this.baseUrl}/${id}/block`);
    return this.http.patch<BuyerDto>(`${this.baseUrl}/${id}/block`, {});
  }

  unblockBuyer(id: string) {
    console.log('[BuyersApiService.unblockBuyer] PATCH', `${this.baseUrl}/${id}/unblock`);
    return this.http.patch<BuyerDto>(`${this.baseUrl}/${id}/unblock`, {});
  }
}

