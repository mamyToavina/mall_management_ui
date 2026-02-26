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

export interface AdminDashboardStatusPoint {
  status: 'SCHEDULED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'REJECTED';
  count: number;
}

export interface AdminDashboardDto {
  period: {
    from: string;
    to: string;
    days: number;
  };
  kpis: {
    revenueTotal: number;
    ordersTotal: number;
    averageOrderValue: number;
    deliverySuccessRate: number;
    rejectionRate: number;
    boutiquesTotal: number;
    boutiquesActive: number;
    boutiquesSuspended: number;
    occupiedBoxes: number;
    availableBoxes: number;
    totalOutstanding: number;
    commissionCollected: number;
    upcomingActivities: number;
  };
  charts: {
    dailyRevenue: Array<{
      date: string;
      revenue: number;
      orders: number;
    }>;
    statusBreakdown: AdminDashboardStatusPoint[];
    monthlyCollections: Array<{
      year: number;
      month: number;
      collected: number;
    }>;
    floorOccupancy: Array<{
      floor: number;
      total: number;
      occupied: number;
      free: number;
    }>;
  };
  rankings: {
    topRevenueBoutiques: Array<{
      boutiqueId: string;
      boutiqueName: string;
      revenue: number;
      orders: number;
    }>;
    topDebtBoutiques: Array<{
      boutiqueId: string;
      boutiqueName: string;
      debt: number;
    }>;
    lowStockByBoutique: Array<{
      boutiqueId: string;
      boutiqueName: string;
      lowStockCount: number;
    }>;
  };
  satisfaction: {
    averageRating: number;
    reviewsCount: number;
    lowRatedBoutiques: Array<{
      boutiqueId: string;
      boutiqueName: string;
      averageRating: number;
      reviewsCount: number;
    }>;
    recentReviews: Array<{
      id: string;
      boutiqueName: string;
      author: string;
      rating: number;
      comment: string;
      createdAt: string;
    }>;
  };
  alerts: {
    highRejectionBoutiques: Array<{
      boutiqueId: string;
      boutiqueName: string;
      rejectionRate: number;
      rejectedOrders: number;
      orders: number;
    }>;
    lowStockBoutiques: Array<{
      boutiqueId: string;
      boutiqueName: string;
      lowStockCount: number;
    }>;
  };
}
