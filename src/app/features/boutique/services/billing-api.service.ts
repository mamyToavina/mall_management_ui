import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import {
  BillingInvoiceDto,
  BillingPaymentResponse,
  BillingRenewalPaginatedResponse,
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

  listMyRenewalRequests(status?: 'PENDING' | 'APPROVED' | 'REJECTED') {
    let params = new HttpParams().set('page', '1').set('limit', '20');
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<BillingRenewalPaginatedResponse>(`${environment.apiBaseUrl}/boutiques/contract-renewals`, {
      params
    });
  }

  createRenewalRequest(payload: {
    requestedTerms: {
      durationMonths: number;
      monthlyRent: number;
      penaltyFee: number;
      penaltyGrowthFactor: number;
      terminationFee: number;
      onlineSalesCommissionPercent: number;
      notes?: string;
    };
    requestNote?: string;
  }) {
    return this.http.post<{ message: string }>(`${environment.apiBaseUrl}/boutiques/contract-renewals`, payload);
  }
}
