import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { UserStatus, PaginatedResponse, BuyerDto } from './buyers.model';
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
      tap((res) => {
        console.log('✅ RESPONSE JSON:', res);
        console.log('✅ RESPONSE JSON (pretty):', JSON.stringify(res, null, 2));
      }),
      catchError((err) => {
        console.error('❌ HTTP ERROR:', err);
        console.error('❌ status:', err?.status);
        console.error('❌ body:', err?.error);
        return throwError(() => err);
      })
    );
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
}
