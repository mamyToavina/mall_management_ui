export interface CreateBoutiqueContractDto {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    boxId: string;
  };
  contract: {
    startDate: string;
    durationMonths: number;
    monthlyRent: number;
    details?: string;
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
    details?: string;
  };
}

export interface CreateTenantApiResponse {
  message: string;
  userId: string;
  activationLink?: string;
  activationToken?: string;
}
