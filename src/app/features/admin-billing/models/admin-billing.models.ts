export interface AdminBillingUploadSuccess {
  fileName: string;
  invoiceId: string;
  boutiqueId: string;
  meterNumber: string;
  netAmount: number;
}

export interface AdminBillingUploadError {
  fileName: string;
  message: string;
}

export interface AdminBillingUploadResult {
  month: number;
  year: number;
  uploaded: number;
  failed: number;
  successes: AdminBillingUploadSuccess[];
  errors: AdminBillingUploadError[];
}
