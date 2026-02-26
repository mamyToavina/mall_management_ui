import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  Credit,
  CreditListQuery,
  CreditMyHistoryResponse,
  CreditListResponse,
  CreditStats,
  UseCreditResult
} from '../model/credit.model';

@Injectable({ providedIn: 'root' })
export class CreditService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/credit`;

  generateCredit(value: number, quantity: number): Observable<ApiResponse<Credit[]>> {
    return this.http.post<ApiResponse<Credit[]>>(`${this.baseUrl}/generate`, { value, quantity });
  }

  listCredits(query: CreditListQuery = {}): Observable<CreditListResponse> {
    let params = new HttpParams();

    for (const [key, rawValue] of Object.entries(query)) {
      if (rawValue === undefined || rawValue === null || rawValue === '') continue;
      params = params.set(key, String(rawValue));
    }

    return this.http.get<CreditListResponse>(this.baseUrl, { params });
  }

  getCreditById(id: string): Observable<ApiResponse<Credit>> {
    return this.http.get<ApiResponse<Credit>>(`${this.baseUrl}/${id}`);
  }

  markAsPrinted(id: string): Observable<ApiResponse<Credit>> {
    return this.http.patch<ApiResponse<Credit>>(`${this.baseUrl}/print/${id}`, {});
  }

  getStats(query: CreditListQuery = {}): Observable<ApiResponse<CreditStats>> {
    let params = new HttpParams();

    for (const [key, rawValue] of Object.entries(query)) {
      if (rawValue === undefined || rawValue === null || rawValue === '') continue;
      if (['page', 'limit', 'sortBy', 'sortOrder'].includes(key)) continue;
      params = params.set(key, String(rawValue));
    }

    return this.http.get<ApiResponse<CreditStats>>(`${this.baseUrl}/stats`, { params });
  }

  useCredit(code: string, idempotencyKey: string): Observable<ApiResponse<UseCreditResult>> {
    const headers = new HttpHeaders({
      'idempotency-key': idempotencyKey
    });

    return this.http.post<ApiResponse<UseCreditResult>>(
      `${this.baseUrl}/use`,
      { code },
      { headers }
    );
  }

  getMyHistory(page = 1, limit = 5): Observable<CreditMyHistoryResponse> {
    const params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    return this.http.get<CreditMyHistoryResponse>(`${this.baseUrl}/my-history`, { params });
  }
}
