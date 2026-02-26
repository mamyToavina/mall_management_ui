import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  AdminContractDto,
  ContractRenewalRequestDto,
  ContractStatus,
  RenewalDecision,
  RenewalTermsDto
} from '../models/tenant.models';
import { BoutiqueService } from '../services/tenant.services';

type AdminView = 'contracts' | 'renewals';

@Component({
  selector: 'app-contracts-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contracts-list-page.component.html',
  styleUrls: ['./contracts-list-page.component.css']
})
export class ContractsListPageComponent {
  contracts: AdminContractDto[] = [];
  renewals: ContractRenewalRequestDto[] = [];

  loading = false;
  actionLoadingId: string | null = null;
  error = '';
  success = '';

  activeView: AdminView = 'contracts';
  statusFilter: ContractStatus = 'ACTIVE';

  renewalStatusFilter: RenewalDecision | 'ALL' = 'PENDING';
  renewalPage = 1;
  renewalLimit = 10;
  renewalTotalPages = 1;
  renewalTotalItems = 0;

  page = 1;
  limit = 10;
  totalPages = 1;
  totalItems = 0;

  selectedRenewal: ContractRenewalRequestDto | null = null;
  showApproveWizard = false;
  showRejectModal = false;
  wizardStep = 1;
  rejectReason = '';
  reviewNote = '';
  finalTerms: RenewalTermsDto = {
    durationMonths: 12,
    monthlyRent: 0,
    penaltyFee: 0,
    penaltyGrowthFactor: 1,
    terminationFee: 0,
    onlineSalesCommissionPercent: 0,
    notes: ''
  };

  private readonly api = inject(BoutiqueService);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    this.loadContracts();
  }

  setView(view: AdminView): void {
    if (this.activeView === view) return;
    this.activeView = view;
    this.error = '';
    this.success = '';
    if (view === 'renewals') this.loadRenewals();
    else this.loadContracts();
  }

  setStatus(status: ContractStatus): void {
    if (this.statusFilter === status) return;
    this.statusFilter = status;
    this.page = 1;
    this.loadContracts();
  }

  setRenewalStatus(status: RenewalDecision | 'ALL'): void {
    if (this.renewalStatusFilter === status) return;
    this.renewalStatusFilter = status;
    this.renewalPage = 1;
    this.loadRenewals();
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

  loadRenewals(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.api
      .listRenewalRequests({
        page: this.renewalPage,
        limit: this.renewalLimit,
        status: this.renewalStatusFilter === 'ALL' ? undefined : this.renewalStatusFilter
      })
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.renewals = res.data || [];
          this.renewalPage = res.meta?.page || this.renewalPage;
          this.renewalTotalPages = res.meta?.pages || 1;
          this.renewalTotalItems = res.meta?.total || 0;
          this.cdr.detectChanges();
        },
        error: (err: Error) => {
          this.loading = false;
          this.renewals = [];
          this.renewalTotalPages = 1;
          this.renewalTotalItems = 0;
          this.error = err.message || 'Impossible de charger les demandes.';
          this.cdr.detectChanges();
        }
      });
  }

  goToPage(nextPage: number): void {
    if (nextPage < 1 || nextPage > this.totalPages || nextPage === this.page) return;
    this.page = nextPage;
    this.loadContracts();
  }

  goToRenewalPage(nextPage: number): void {
    if (nextPage < 1 || nextPage > this.renewalTotalPages || nextPage === this.renewalPage) return;
    this.renewalPage = nextPage;
    this.loadRenewals();
  }

  terminate(contract: AdminContractDto): void {
    if (!window.confirm('Confirmer la résiliation de ce contrat ?')) return;
    this.runStatusAction(contract._id, 'TERMINATED');
  }

  reactivate(contract: AdminContractDto): void {
    if (!window.confirm('Confirmer la réactivation de ce contrat ?')) return;
    this.runStatusAction(contract._id, 'ACTIVE');
  }

  openApproveWizard(request: ContractRenewalRequestDto): void {
    this.selectedRenewal = request;
    this.wizardStep = 1;
    this.reviewNote = '';
    this.finalTerms = {
      durationMonths: request.requestedTerms.durationMonths,
      monthlyRent: request.requestedTerms.monthlyRent,
      penaltyFee: request.requestedTerms.penaltyFee,
      penaltyGrowthFactor: request.requestedTerms.penaltyGrowthFactor,
      terminationFee: request.requestedTerms.terminationFee,
      onlineSalesCommissionPercent: request.requestedTerms.onlineSalesCommissionPercent,
      notes: request.requestedTerms.notes || ''
    };
    this.showApproveWizard = true;
  }

  openRejectModal(request: ContractRenewalRequestDto): void {
    this.selectedRenewal = request;
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  closeRenewalModals(): void {
    this.showApproveWizard = false;
    this.showRejectModal = false;
    this.selectedRenewal = null;
    this.actionLoadingId = null;
  }

  nextWizardStep(): void {
    this.wizardStep = Math.min(3, this.wizardStep + 1);
  }

  previousWizardStep(): void {
    this.wizardStep = Math.max(1, this.wizardStep - 1);
  }

  approveSelectedRenewal(): void {
    if (!this.selectedRenewal) return;
    this.actionLoadingId = this.selectedRenewal._id;
    this.error = '';
    this.success = '';

    this.api
      .approveRenewalRequest(this.selectedRenewal._id, {
        finalTerms: this.finalTerms,
        reviewNote: this.reviewNote || ''
      })
      .subscribe({
        next: (res) => {
          this.actionLoadingId = null;
          this.success = res.message || 'Demande approuvée.';
          this.closeRenewalModals();
          this.loadRenewals();
        },
        error: (err: Error) => {
          this.actionLoadingId = null;
          this.error = err.message || "Impossible d'approuver cette demande.";
          this.cdr.detectChanges();
        }
      });
  }

  rejectSelectedRenewal(): void {
    if (!this.selectedRenewal) return;
    if (!this.rejectReason.trim()) {
      this.error = 'Le motif de refus est obligatoire.';
      return;
    }

    this.actionLoadingId = this.selectedRenewal._id;
    this.error = '';
    this.success = '';

    this.api.rejectRenewalRequest(this.selectedRenewal._id, this.rejectReason.trim()).subscribe({
      next: (res) => {
        this.actionLoadingId = null;
        this.success = res.message || 'Demande rejetée.';
        this.closeRenewalModals();
        this.loadRenewals();
      },
      error: (err: Error) => {
        this.actionLoadingId = null;
        this.error = err.message || 'Impossible de rejeter cette demande.';
        this.cdr.detectChanges();
      }
    });
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

    this.api.updateContractStatus(contractId, nextStatus).subscribe({
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
