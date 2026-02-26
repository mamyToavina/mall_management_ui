export interface CreateBoutiqueContractDto {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    boxId: string;
    selectedBoxMonthlyRent?: number;
  };
  contract: {
    startDate: string;
    durationMonths: number;
    monthlyRent: number;
    penaltyFee: number;
    penaltyGrowthFactor: number;
    terminationFee: number;
    onlineSalesCommissionPercent: number;
    notes?: string;
  };
}

export interface CreateTenantApiRequest {
  firstName: string;
  lastName: string;
  email: string;
  boxId: string;
  contractData: {
    startDate: string;
    durationMonths: number;
    monthlyRent: number;
    penaltyFee: number;
    penaltyGrowthFactor: number;
    terminationFee: number;
    onlineSalesCommissionPercent: number;
    notes?: string;
  };
}

export interface CreateTenantApiResponse {
  message: string;
  userId: string;
  activationLink?: string;
  activationToken?: string;
}

export interface GeneralSettingsDto {
  mallAddress: string;
  mallLatitude: number;
  mallLongitude: number;
  defaultPenaltyFee: number;
  penaltyGrowthFactor: number;
  defaultTerminationFee: number;
  defaultOnlineSalesCommissionPercent: number;
}

export type ContractStatus = 'ACTIVE' | 'SCHEDULED' | 'TERMINATED' | 'EXPIRED';

export interface AdminContractDto {
  _id: string;
  startDate: string;
  endDate: string;
  durationMonths: number;
  monthlyRent: number;
  penaltyFee: number;
  penaltyGrowthFactor: number;
  terminationFee: number;
  onlineSalesCommissionPercent: number;
  notes?: string;
  status: ContractStatus;
  boutique: {
    _id: string;
    name: string;
  } | null;
  tenant: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
  } | null;
  box: {
    id: string;
    number: string;
    floor: number;
  } | null;
}

export interface ContractsPaginatedResponse {
  data: AdminContractDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export type RenewalDecision = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface RenewalTermsDto {
  durationMonths: number;
  monthlyRent: number;
  penaltyFee: number;
  penaltyGrowthFactor: number;
  terminationFee: number;
  onlineSalesCommissionPercent: number;
  notes?: string;
}

export interface ContractRenewalRequestDto {
  _id: string;
  boutique: {
    _id: string;
    name: string;
  } | null;
  requesterUser: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  currentContract: {
    _id: string;
    startDate: string;
    endDate: string;
    durationMonths: number;
    monthlyRent: number;
    penaltyFee: number;
    penaltyGrowthFactor: number;
    terminationFee: number;
    onlineSalesCommissionPercent: number;
    notes?: string;
    status: ContractStatus | 'SCHEDULED';
  } | null;
  requestedTerms: RenewalTermsDto;
  requestNote?: string;
  adminDecision: RenewalDecision;
  reviewNote?: string;
  reviewedAt?: string | null;
  settlementSnapshot?: {
    outstandingTotal: number;
    rentOutstanding: number;
    electricityOutstanding: number;
    penaltyOutstanding: number;
  } | null;
  approvedContract?: {
    _id: string;
    startDate: string;
    endDate: string;
    status: ContractStatus | 'SCHEDULED';
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContractRenewalPaginatedResponse {
  data: ContractRenewalRequestDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
