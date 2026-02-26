import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import {
  AdminBillingTrace,
  AdminBillingUploadResult,
  AdminBoutiqueBillingSummary
} from '../models/admin-billing.models';

@Injectable({ providedIn: 'root' })
export class AdminBillingApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/billing/admin`;

  uploadElectricityInvoices(month: number, year: number, files: File[]) {
    const formData = new FormData();
    formData.append('month', String(month));
    formData.append('year', String(year));
    for (const file of files) {
      formData.append('invoices', file, file.name);
    }
    return this.http.post<AdminBillingUploadResult>(
      `${this.baseUrl}/electricity-invoices/upload`,
      formData
    );
  }

  listTraces(month: number, year: number) {
    const params = new HttpParams().set('month', String(month)).set('year', String(year));
    return this.http.get<AdminBillingTrace[]>(`${this.baseUrl}/traces`, { params });
  }

  listTracesFiltered(params: {
    month?: number;
    year?: number;
    boutiqueId?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    let httpParams = new HttpParams();
    if (params.month) httpParams = httpParams.set('month', String(params.month));
    if (params.year) httpParams = httpParams.set('year', String(params.year));
    if (params.boutiqueId) httpParams = httpParams.set('boutiqueId', params.boutiqueId);
    if (params.fromDate) httpParams = httpParams.set('fromDate', params.fromDate);
    if (params.toDate) httpParams = httpParams.set('toDate', params.toDate);
    return this.http.get<AdminBillingTrace[]>(`${this.baseUrl}/traces`, { params: httpParams });
  }

  listBoutiquesSummary(month: number, year: number) {
    const params = new HttpParams().set('month', String(month)).set('year', String(year));
    return this.http.get<AdminBoutiqueBillingSummary[]>(`${this.baseUrl}/boutiques-summary`, { params });
  }
}
