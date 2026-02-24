export interface BillingInvoiceDto {
  _id: string;
  boutique: string;
  box: string;
  month: number;
  year: number;
  meterNumber: string;
  netAmount: number;
  commissionAmount: number;
  sourceFilePath: string;
  sourceFileName: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillingRemainingDuration {
  years: number;
  months: number;
  days: number;
  totalDays: number;
}

export interface BillingContractSummary {
  id: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  remaining: BillingRemainingDuration;
}

export interface BillingDuesSummary {
  rentAmount: number;
  electricityAmount: number;
  commissionsAmount: number;
  totalDue: number;
}

export interface BillingSummaryDto {
  filter: {
    month: number;
    year: number;
  };
  contract: BillingContractSummary | null;
  dues: BillingDuesSummary;
  invoices: BillingInvoiceDto[];
}
