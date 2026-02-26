import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { AdminBillingUploadResult } from '../models/admin-billing.models';

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
}
