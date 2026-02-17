import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { BoxStatus, BoxesPaginatedResponse, BoxesStatsDto, BoxFullDetailsDto, BoxDto } from '../models/box.models';
import { environment } from '../../../../environments/environment';


export interface BoxesQuery {
  page: number;
  limit: number;

  floor?: number;
  minSurface?: number;
  maxSurface?: number;
  minRent?: number;
  maxRent?: number;

  status?: BoxStatus | '';
}

@Injectable({ providedIn: 'root' })
export class BoxesApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/boxes`;

  getBoxes(query: BoxesQuery) {
    let params = new HttpParams()
      .set('page', String(query.page))
      .set('limit', String(query.limit));

    if (query.floor !== undefined && query.floor !== null && query.floor !== ('' as any)) {
      params = params.set('floor', String(query.floor));
    }

    if (query.minSurface !== undefined && query.minSurface !== null) {
      params = params.set('minSurface', String(query.minSurface));
    }

    if (query.maxSurface !== undefined && query.maxSurface !== null) {
      params = params.set('maxSurface', String(query.maxSurface));
    }

    if (query.minRent !== undefined && query.minRent !== null) {
      params = params.set('minRent', String(query.minRent));
    }

    if (query.maxRent !== undefined && query.maxRent !== null) {
      params = params.set('maxRent', String(query.maxRent));
    }

    if (query.status) {
      params = params.set('status', query.status);
    }

    return this.http.get<BoxesPaginatedResponse>(this.baseUrl, { params }).pipe(
      tap((res) => {
        console.log('✅ BOXES RESPONSE JSON:', res);
        console.log('✅ BOXES RESPONSE JSON (pretty):', JSON.stringify(res, null, 2));
      }),
      catchError((err) => {
        console.error('❌ BOXES HTTP ERROR:', err);
        console.error('❌ status:', err?.status);
        console.error('❌ body:', err?.error);
        return throwError(() => err);
      })
    );
  }

  getStatistics() {
    return this.http.get<BoxesStatsDto>(`${this.baseUrl}/statistics`).pipe(
      tap((res) => {
        console.log('✅ BOXES STATS JSON:', res);
        console.log('✅ BOXES STATS JSON (pretty):', JSON.stringify(res, null, 2));
      }),
      catchError((err) => {
        console.error('❌ BOXES STATS HTTP ERROR:', err);
        console.error('❌ status:', err?.status);
        console.error('❌ body:', err?.error);
        return throwError(() => err);
      })
    );
  }

  getFullDetails(id: string) {
    return this.http.get<BoxFullDetailsDto>(`${this.baseUrl}/${id}/full-details`).pipe(
      tap((res) => {
        console.log('✅ BOX FULL DETAILS JSON:', res);
        console.log('✅ BOX FULL DETAILS JSON (pretty):', JSON.stringify(res, null, 2));
      }),
      catchError((err) => {
        console.error('❌ BOX FULL DETAILS HTTP ERROR:', err);
        console.error('❌ status:', err?.status);
        console.error('❌ body:', err?.error);
        return throwError(() => err);
      })
    );
  }

  createBox(payload: Partial<BoxDto>) {
    return this.http.post<BoxDto>(this.baseUrl, payload).pipe(
      tap((res) => console.log('✅ BOX CREATED:', res)),
      catchError((err) => {
        console.error('❌ BOX CREATE ERROR:', err);
        return throwError(() => err);
      })
    );
  }

  updateBox(id: string, payload: Partial<BoxDto>) {
    return this.http.put<BoxDto>(`${this.baseUrl}/${id}`, payload).pipe(
      tap((res) => console.log('✅ BOX UPDATED:', res)),
      catchError((err) => {
        console.error('❌ BOX UPDATE ERROR:', err);
        return throwError(() => err);
      })
    );
  }

  deleteBox(id: string) {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`).pipe(
      tap((res) => console.log('✅ BOX DELETED:', res)),
      catchError((err) => {
        console.error('❌ BOX DELETE ERROR:', err);
        return throwError(() => err);
      })
    );
  }
}
