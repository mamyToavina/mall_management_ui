import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import {
  BillingInvoiceDto,
  BillingPaymentResponse,
  BillingSummaryDto,
  BillingTraceDto
} from '../models/billing.models';

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

  payRentNow(month: number, year: number, amount?: number) {
    let params = new HttpParams().set('month', String(month)).set('year', String(year));
    return this.http.post<BillingPaymentResponse>(`${this.baseUrl}/pay/rent`, { amount }, { params });
  }

  payElectricityNow(month: number, year: number, amount?: number) {
    const params = new HttpParams().set('month', String(month)).set('year', String(year));
    return this.http.post<BillingPaymentResponse>(`${this.baseUrl}/pay/electricity`, { amount }, { params });
  }

  listMyTraces(month: number, year: number) {
    const params = new HttpParams().set('month', String(month)).set('year', String(year));
    return this.http.get<BillingTraceDto[]>(`${this.baseUrl}/traces`, { params });
  }
}
