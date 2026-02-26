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
  durationMonths: number;
  monthlyRent: number;
  penaltyFee: number;
  penaltyGrowthFactor: number;
  terminationFee: number;
  onlineSalesCommissionPercent: number;
  notes?: string;
  status?: 'ACTIVE' | 'TERMINATED' | 'EXPIRED';
  remaining: BillingRemainingDuration;
}

export interface BillingLineSummary {
  due: number;
  paid: number;
  autoPaid: number;
  manualPaid: number;
  remaining: number;
  status: 'PAID' | 'PARTIAL' | 'UNPAID';
  autoDeducted: boolean;
  dueDate?: string | null;
}

export interface BillingPenaltyItem {
  source: 'RENT' | 'ELECTRICITY';
  reason: string;
  baseFee: number;
  monthsLate: number;
  growthFactor: number;
  amountDue: number;
}

export interface BillingCommissionItem {
  traceId: string;
  saleReference: string;
  saleDate: string;
  clientName: string;
  clientEmail: string;
  saleAmount: number;
  commissionRate: number;
  commissionAmount: number;
  autoDeducted: boolean;
  status: string;
}

export interface BillingTraceDto {
  _id: string;
  month: number;
  year: number;
  category: 'COMMISSION' | 'RENT' | 'ELECTRICITY' | 'PENALTY';
  action: 'AUTO_DEBIT' | 'MANUAL_PAYMENT' | 'SALE_COMMISSION';
  automatic: boolean;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'APPLIED' | 'PARTIAL' | 'PENDING';
  reason: string;
  referenceType: string;
  referenceId?: string;
  referenceLabel?: string;
  details?: any;
  createdAt: string;
}

export interface BillingSummaryDto {
  filter: {
    month: number;
    year: number;
  };
  contract: BillingContractSummary | null;
  dues: {
    rent: BillingLineSummary;
    electricity: BillingLineSummary;
    totalToPay: number;
  };
  penalties: BillingLineSummary & {
    items: BillingPenaltyItem[];
  };
  commission: {
    totalSalesAmount: number;
    totalCommissionAmount: number;
    autoDeductedAmount: number;
    remainingAmount: number;
    items: BillingCommissionItem[];
  };
  invoices: BillingInvoiceDto[];
}

export interface BillingPaymentResponse {
  message: string;
  summary: BillingSummaryDto;
}

export type BillingRenewalDecision = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface BillingRenewalTerms {
  durationMonths: number;
  monthlyRent: number;
  penaltyFee: number;
  penaltyGrowthFactor: number;
  terminationFee: number;
  onlineSalesCommissionPercent: number;
  notes?: string;
}

export interface BillingRenewalRequestDto {
  _id: string;
  requestedTerms: BillingRenewalTerms;
  requestNote?: string;
  adminDecision: BillingRenewalDecision;
  reviewNote?: string;
  reviewedAt?: string | null;
  settlementSnapshot?: {
    outstandingTotal: number;
    rentOutstanding: number;
    electricityOutstanding: number;
    penaltyOutstanding: number;
  } | null;
  currentContract: {
    _id: string;
    startDate: string;
    endDate: string;
    durationMonths: number;
    monthlyRent: number;
    penaltyFee: number;
    penaltyGrowthFactor: number;
    terminationFee: number;
    onlineSalesCommissionPercent: number;
    notes?: string;
    status: string;
  } | null;
  approvedContract?: {
    _id: string;
    startDate: string;
    endDate: string;
    status: string;
  } | null;
  createdAt: string;
}

export interface BillingRenewalPaginatedResponse {
  data: BillingRenewalRequestDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
