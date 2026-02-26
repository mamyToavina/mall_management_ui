export type DashboardFulfillmentStatus =
  | 'SCHEDULED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'REJECTED';

export interface DashboardDailyRevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface DashboardStatusPoint {
  status: DashboardFulfillmentStatus;
  label: string;
  count: number;
}

export interface DashboardTopProduct {
  productId: string;
  name: string;
  imageUrl: string | null;
  quantity: number;
  revenue: number;
  currency: string;
}

export interface DashboardRecentOrder {
  id: string;
  reference: string;
  placedAt: string;
  customerName: string;
  fulfillmentStatus: DashboardFulfillmentStatus;
  deliveryDate: string;
  subtotal: number;
  currency: string;
}

export interface BoutiqueDashboardDto {
  boutique: {
    id: string;
    name: string;
  };
  period: {
    from: string;
    to: string;
    days: number;
  };
  kpis: {
    revenueTotal: number;
    ordersTotal: number;
    averageOrderValue: number;
    pendingOrders: number;
    deliveredOrders: number;
    rejectedOrders: number;
    deliverySuccessRate: number;
    rejectionRate: number;
    currency: string;
  };
  finance: {
    rentRemaining: number;
    electricityRemaining: number;
    penaltiesRemaining: number;
    totalOutstanding: number;
    commissionTotal: number;
    currency: string;
    warning?: string;
  };
  inventory: {
    totalProducts: number;
    activeProducts: number;
    publishedProducts: number;
    lowStockProducts: number;
  };
  reputation: {
    averageRating: number;
    reviewsCount: number;
  };
  charts: {
    dailyRevenue: DashboardDailyRevenuePoint[];
    statusBreakdown: DashboardStatusPoint[];
    topProducts: DashboardTopProduct[];
  };
  recentOrders: DashboardRecentOrder[];
}
