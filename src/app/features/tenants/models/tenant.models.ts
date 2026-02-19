export interface CreateBoutiqueContractDto {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    boxId : string;
  };
  contract: {
    startDate: string;        // ISO string (ex: "2026-02-17")
    durationMonths: number;   // min 3
    monthlyRent: number;      // min 0
    details?: string;
  };
}
