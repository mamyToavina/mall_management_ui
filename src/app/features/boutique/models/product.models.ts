export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type StockOperation = 'INCREMENT' | 'DECREMENT' | 'SET';
export type StockMovementType = 'INITIAL' | 'IN' | 'OUT' | 'SET';

export interface ProductPromotion {
  enabled?: boolean;
  percentage?: number;
  startsAt?: string;
  durationDays?: number;
  endsAt?: string;
}

export interface ProductDto {
  _id: string;
  name: string;
  sku: string;
  category?: string;
  subCategory?: string;
  brand?: string;
  description?: string;
  tags?: string[];
  price: number;
  salePrice?: number;
  costPrice?: number;
  taxRate?: number;
  unit?: string;
  currentSellingPrice?: number;
  promotionPrice?: number | null;
  isPromotionActive?: boolean;
  trackStock?: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  allowBackorder?: boolean;
  status: ProductStatus;
  isPublished?: boolean;
  images?: string[];
  promotion?: ProductPromotion | null;
  createdAt?: string;
  updatedAt?: string;
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

export interface ProductCatalogQuery {
  page: number;
  limit: number;
  search?: string;
  status?: ProductStatus | '';
  category?: string;
  lowStock?: boolean;
}

export interface StockMovementDto {
  _id: string;
  product: string;
  boutique: string;
  createdBy: string;
  type: StockMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  note?: string;
  reference?: string;
  createdAt?: string;
  updatedAt?: string;
}
