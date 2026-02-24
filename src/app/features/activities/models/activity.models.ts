export interface ActivityPublicDto {
  id: string;
  title: string;
  description: string;
  dateIso: string;
  durationDays: number;
  location: string;
  imageUrl: string;
  tag: string;
}

export interface ActivityDto extends ActivityPublicDto {
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityListQuery {
  page?: number;
  limit?: number;
  search?: string;
  published?: boolean;
  upcoming?: boolean;
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

export interface UpsertActivityPayload {
  title: string;
  description: string;
  dateIso: string;
  durationDays: number;
  location: string;
  tag: string;
  isPublished?: boolean;
}
