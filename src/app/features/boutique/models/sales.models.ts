export type BoutiqueFulfillmentStatus =
  | 'SCHEDULED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'REJECTED';

export interface BoutiqueSaleItemDto {
  product: string;
  boutique: string;
  productName: string;
  sku: string;
  imageUrl?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  currency: string;
}

export interface BoutiqueOrderSegmentDto {
  boutique: string;
  boutiqueName: string;
  itemCount: number;
  quantityTotal: number;
  subtotal: number;
  currency: string;
  deliveryDate: string;
  fulfillmentStatus: BoutiqueFulfillmentStatus;
  fulfillmentNote?: string | null;
  processedAt?: string | null;
}

export interface BoutiqueSaleTotalsDto {
  itemCount: number;
  quantityTotal: number;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  currency: string;
}

export interface BoutiqueSaleDto {
  id: string;
  reference: string;
  buyer: string;
  buyerSnapshot?: {
    pseudo?: string | null;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  };
  placedAt: string;
  status: 'PLACED' | 'PROCESSING' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PAID';
  paymentMethod: 'CREDIT';
  deliveryContact: {
    pickupLocation: string;
    contactPhone: string;
  };
  deliveryCapacityPolicy: 'AUTO_NEXT_AVAILABLE' | 'CANCEL_IF_FULL';
  totals: BoutiqueSaleTotalsDto;
  boutiqueOrder: BoutiqueOrderSegmentDto;
  items: BoutiqueSaleItemDto[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

