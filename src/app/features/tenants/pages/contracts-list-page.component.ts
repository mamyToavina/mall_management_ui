import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminContractDto, ContractStatus } from '../models/tenant.models';
import { BoutiqueService } from '../services/tenant.services';

@Component({
  selector: 'app-contracts-list-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contracts-list-page.component.html',
  styleUrls: ['./contracts-list-page.component.css']
})
export class ContractsListPageComponent {
  contracts: AdminContractDto[] = [];
  loading = false;
  actionLoadingId: string | null = null;
  error = '';
  success = '';
  statusFilter: ContractStatus = 'ACTIVE';
  page = 1;
  limit = 10;
  totalPages = 1;
  totalItems = 0;

  private api = inject(BoutiqueService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    this.loadContracts();
  }

  setStatus(status: ContractStatus): void {
    if (this.statusFilter === status) return;
    this.statusFilter = status;
    this.page = 1;
    this.loadContracts();
  }

  loadContracts(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.api
      .getContracts({ page: this.page, limit: this.limit, status: this.statusFilter })
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.contracts = res.data || [];
          this.page = res.meta?.page || this.page;
          this.totalPages = res.meta?.pages || 1;
          this.totalItems = res.meta?.total || 0;
          this.cdr.detectChanges();
        },
        error: (err: Error) => {
          this.loading = false;
          this.contracts = [];
          this.totalPages = 1;
          this.totalItems = 0;
          this.error = err.message || 'Impossible de charger les contrats.';
          this.cdr.detectChanges();
        }
      });
  }

  goToPage(nextPage: number): void {
    if (nextPage < 1 || nextPage > this.totalPages || nextPage === this.page) return;
    this.page = nextPage;
    this.loadContracts();
  }

  terminate(contract: AdminContractDto): void {
    if (!window.confirm('Confirmer la résiliation de ce contrat ?')) return;
    this.runStatusAction(contract._id, 'TERMINATED');
  }

  reactivate(contract: AdminContractDto): void {
    if (!window.confirm('Confirmer la réactivation de ce contrat ?')) return;
    this.runStatusAction(contract._id, 'ACTIVE');
  }

  fullTenantName(contract: AdminContractDto): string {
    if (!contract.tenant) return 'N/A';
    return `${contract.tenant.firstName || ''} ${contract.tenant.lastName || ''}`.trim() || contract.tenant.email;
  }

  tenantBoutiqueName(contract: AdminContractDto): string {
    return contract.boutique?.name || 'N/A';
  }

  private runStatusAction(contractId: string, nextStatus: 'ACTIVE' | 'TERMINATED'): void {
    this.actionLoadingId = contractId;
    this.error = '';
    this.success = '';

    this.api
      .updateContractStatus(contractId, nextStatus)
      .subscribe({
        next: (res) => {
          this.actionLoadingId = null;
          this.success = res.message || 'Statut mis à jour.';
          this.loadContracts();
          this.cdr.detectChanges();
        },
        error: (err: Error) => {
          this.actionLoadingId = null;
          this.error = err.message || 'Mise à jour impossible.';
          this.cdr.detectChanges();
        }
      });
  }
}
