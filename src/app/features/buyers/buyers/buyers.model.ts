export type UserStatus = 'ACTIVE' | 'BLOCKED';

export interface BuyerDto {
  _id: string;
  pseudo: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  credit: number;
  status: UserStatus;
  role: 'USER' | 'ADMIN' | string;
  isAccountCompleted: boolean;
  blockedAt?: string | null;
  blockedReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export type BuyerHistoryType = 'ALL' | 'CREDIT_USAGE' | 'PURCHASE' | 'REVIEW';

export interface BuyerHistoryEntry {
  id: string;
  entryType: Exclude<BuyerHistoryType, 'ALL'>;
  title: string;
  occurredAt: string;
  amount: number | null;
  rating: number | null;
  boutiqueName: string | null;
  reference: string | null;
  details: Record<string, unknown>;
}

export interface BuyerHistoryFilters {
  type?: BuyerHistoryType;
  from?: string;
  to?: string;
  minAmount?: number | null;
  maxAmount?: number | null;
  rating?: number | null;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BuyerHistorySummary {
  totalAmount: number;
  byType: {
    CREDIT_USAGE: number;
    PURCHASE: number;
    REVIEW: number;
  };
}

export interface BuyerHistoryResponse {
  data: BuyerHistoryEntry[];
  meta: PaginationMeta;
  summary: BuyerHistorySummary;
}
