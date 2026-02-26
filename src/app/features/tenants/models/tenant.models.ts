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

export type ContractStatus = 'ACTIVE' | 'TERMINATED' | 'EXPIRED';

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
