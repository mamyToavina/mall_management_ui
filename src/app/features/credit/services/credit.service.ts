import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, Credit } from '../model/credit.model';

@Injectable({ providedIn: 'root' })
export class CreditService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/credit`;

  generateCredit(adminId: string, value: number, quantity: number): Observable<ApiResponse<Credit[]>> {
    return this.http.post<ApiResponse<Credit[]>>(`${this.baseUrl}/generate`, { adminId, value, quantity });
  }
  

  listCredits(): Observable<ApiResponse<Credit[]>> {
    return this.http.get<ApiResponse<Credit[]>>(this.baseUrl);
  }

  getCreditById(id: string): Observable<ApiResponse<Credit>> {
    return this.http.get<ApiResponse<Credit>>(`${this.baseUrl}/${id}`);
  }

  markAsPrinted(id: string): Observable<ApiResponse<Credit>> {
    return this.http.patch<ApiResponse<Credit>>(`${this.baseUrl}/print/${id}`, {});
  }
}
