export type BoxStatus = 'libre' | 'occupied';

export interface BoxDto {
  _id: string;
  number: string;
  floor: number;
  surface: number;
  monthlyRent: number;
  electricityMeterNumber?: string | null;
  boutique?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface BoxesStatsDto {
  total: number;
  free: number;
  occupied: number;
}

export interface BoxesPaginatedResponse {
  data: BoxDto[];
  meta: PaginationMeta;
  stats: BoxesStatsDto;
}

export interface BoxFullDetailsDto {
  box: any;
  contract: any;
}
