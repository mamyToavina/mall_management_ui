export type CreditStatus = 'active' | 'used' | 'expired';

export interface CreditUserSummary {
  _id: string;
  pseudo?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: 'ADMIN' | 'BOUTIQUE' | 'USER';
}

export interface CreditHistoryEvent {
  action: 'generated' | 'printed' | 'used' | 'expired' | 'cancelled';
  by?: string | null;
  at: string;
  metadata?: unknown;
}

export interface Credit {
  _id: string;
  code: string;
  value: number;
  status: CreditStatus;
  isPrinted: boolean;
  printedAt?: string | null;
  createdBy?: string | CreditUserSummary;
  usedBy?: string | CreditUserSummary | null;
  usedAt?: string | null;
  expiresAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  idempotencyKeyHash?: string | null;
  history?: CreditHistoryEvent[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
}

export interface CreditListQuery {
  status?: CreditStatus | '';
  value?: number | '';
  createdBy?: string;
  usedBy?: string;
  code?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'value' | 'expiresAt' | 'usedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreditListResponse {
  success: boolean;
  data: Credit[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CreditMyHistoryResponse {
  success: boolean;
  data: Credit[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CreditStats {
  totals: {
    totalCredits: number;
    totalValue: number;
    activeCredits: number;
    usedCredits: number;
    expiredCredits: number;
    printedCredits: number;
  };
  breakdown: {
    byStatus: Array<{ _id: CreditStatus; count: number; totalValue: number }>;
    byValue: Array<{ _id: number; count: number; totalValue: number }>;
  };
}

export interface UseCreditResult {
  credit: Credit;
  newBalance: number;
  replayed: boolean;
}
