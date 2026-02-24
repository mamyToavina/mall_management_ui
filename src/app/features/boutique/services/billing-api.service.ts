import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { BillingInvoiceDto, BillingSummaryDto } from '../models/billing.models';

@Injectable({ providedIn: 'root' })
export class BillingApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/billing/boutique`;

  getMySummary(month: number, year: number) {
    const params = new HttpParams().set('month', String(month)).set('year', String(year));
    return this.http.get<BillingSummaryDto>(`${this.baseUrl}/summary`, { params });
  }

  listMyInvoices(month: number, year: number) {
    const params = new HttpParams().set('month', String(month)).set('year', String(year));
    return this.http.get<BillingInvoiceDto[]>(`${this.baseUrl}/invoices`, { params });
  }

  getMyInvoiceById(invoiceId: string) {
    return this.http.get<BillingInvoiceDto>(`${this.baseUrl}/invoices/${invoiceId}`);
  }
}
