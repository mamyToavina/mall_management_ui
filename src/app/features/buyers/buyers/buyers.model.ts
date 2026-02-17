export type UserStatus = 'ACTIVE' | 'BLOCKED';

export interface BuyerDto {
  _id: string;
  pseudo: string;
  email: string;
  firstName?: string | null;
  avatar?: string | null;
  credit: number;
  status: UserStatus;
  role: 'USER' | 'ADMIN' | string;
  isAccountCompleted: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
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
