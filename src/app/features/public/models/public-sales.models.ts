export type DeliveryCapacityPolicy = 'AUTO_NEXT_AVAILABLE' | 'CANCEL_IF_FULL';

export interface CheckoutItemPayload {
  productId: string;
  quantity: number;
}

export interface CheckoutPayload {
  items: CheckoutItemPayload[];
  deliveryCapacityPolicy: DeliveryCapacityPolicy;
  pickupLocation: string;
  contactPhone: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export type OrderStatus = 'PLACED' | 'PROCESSING' | 'DELIVERED' | 'CANCELLED';
export type FulfillmentStatus =
  | 'SCHEDULED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'REJECTED';

export interface MySaleLineDto {
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

export interface MySaleBoutiqueBreakdownDto {
  boutique: string;
  boutiqueName: string;
  itemCount: number;
  quantityTotal: number;
  subtotal: number;
  currency: string;
  deliveryDate: string;
  fulfillmentStatus: FulfillmentStatus;
  fulfillmentNote?: string | null;
  processedAt?: string | null;
}

export interface MySaleTotalsDto {
  itemCount: number;
  quantityTotal: number;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  currency: string;
}

export interface MySaleDto {
  _id: string;
  reference: string;
  buyer: string;
  buyerSnapshot?: {
    pseudo?: string | null;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  };
  items: MySaleLineDto[];
  boutiqueBreakdown: MySaleBoutiqueBreakdownDto[];
  totals: MySaleTotalsDto;
  deliveryContact: {
    pickupLocation: string;
    contactPhone: string;
  };
  deliveryCapacityPolicy: DeliveryCapacityPolicy;
  paymentMethod: 'CREDIT';
  paymentStatus: 'PAID';
  status: OrderStatus;
  placedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SuccessResponse<T> {
  success: boolean;
  data: T;
}

export interface SuccessListResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

