import { Injectable } from '@angular/core';
import { CreateBoutiqueContractDto } from '../../models/tenant.models';

type UserDraft = CreateBoutiqueContractDto['user'];
type ContractDraft = CreateBoutiqueContractDto['contract'];

@Injectable({ providedIn: 'root' })
export class BoutiqueWizardStore {
  private user: UserDraft | null = null;
  private contract: ContractDraft | null = null;

  setUser(user: UserDraft) { this.user = user; }
  getUser() { return this.user; }

  setContract(contract: ContractDraft) { this.contract = contract; }
  getContract() { return this.contract; }

  buildDto(): CreateBoutiqueContractDto {
    if (!this.user) throw new Error('User draft missing');
    if (!this.contract) throw new Error('Contract draft missing');
    return { user: this.user, contract: this.contract };
  }

  clear() {
    this.user = null;
    this.contract = null;
  }
}
