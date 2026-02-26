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

export interface AdminBillingTrace {
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
  referenceLabel?: string;
  createdAt: string;
  boutique?: {
    _id: string;
    name: string;
  };
  ownerUser?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export interface AdminBillingLineAmount {
  due: number;
  paid: number;
  remaining: number;
  cyclesCount?: number;
}

export interface AdminBoutiqueBillingSummary {
  boutique: {
    _id: string;
    name: string;
  };
  filter: {
    month: number;
    year: number;
  };
  totals: {
    due: number;
    received: number;
    remaining: number;
  };
  details: {
    arrearsOtherMonths: {
      rent: AdminBillingLineAmount;
      electricity: AdminBillingLineAmount;
    };
    currentMonth: {
      rent: AdminBillingLineAmount;
      electricity: AdminBillingLineAmount;
      penalty: AdminBillingLineAmount;
    };
    cycles: Array<{
      month: number;
      year: number;
      rent: AdminBillingLineAmount;
      electricity: AdminBillingLineAmount;
      penalty: AdminBillingLineAmount;
    }>;
  };
}
