import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CreditService } from '../services/credit.service';
import { Credit, CreditListQuery, CreditUserSummary } from '../model/credit.model';

@Component({
  selector: 'app-credit-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: '../pages/credit-list/credit-list.component.html',
  styleUrls: ['../pages/credit-list/credit-list.component.css']
})
export class CreditListComponent {
  private creditService = inject(CreditService);

  readonly amounts = [20000, 100000, 400000];
  readonly statusOptions = ['active', 'used', 'expired'] as const;
  readonly sortByOptions = ['createdAt', 'value', 'expiresAt', 'usedAt'] as const;

  dashboardLoading = signal(false);
  errorMessage = signal<string | null>(null);

  credits = signal<Credit[]>([]);
  meta = signal({ total: 0, page: 1, limit: 20, pages: 1 });

  filterStatus = signal<'' | 'active' | 'used' | 'expired'>('');
  filterValue = signal<number | ''>('');
  filterCode = signal('');
  filterDateFrom = signal('');
  filterDateTo = signal('');
  sortBy = signal<'createdAt' | 'value' | 'expiresAt' | 'usedAt'>('createdAt');
  sortOrder = signal<'asc' | 'desc'>('desc');
  page = signal(1);
  limit = signal(20);

  selectedUsedBy = signal<CreditUserSummary | null>(null);
  selectedCreditCode = signal<string | null>(null);

  constructor() {
    this.loadList();
  }

  private buildQuery(): CreditListQuery {
    return {
      status: this.filterStatus(),
      value: this.filterValue(),
      code: this.filterCode().trim() || undefined,
      dateFrom: this.filterDateFrom() || undefined,
      dateTo: this.filterDateTo() || undefined,
      page: this.page(),
      limit: this.limit(),
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder()
    };
  }

  loadList() {
    this.dashboardLoading.set(true);
    this.errorMessage.set(null);

    this.creditService.listCredits(this.buildQuery()).subscribe({
      next: (listRes) => {
        this.credits.set(listRes.data ?? []);
        this.meta.set(
          listRes.meta ?? {
            total: 0,
            page: this.page(),
            limit: this.limit(),
            pages: 1
          }
        );
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message || 'Impossible de charger la liste des credits.');
      },
      complete: () => {
        this.dashboardLoading.set(false);
      }
    });
  }

  resetFilters() {
    this.filterStatus.set('');
    this.filterValue.set('');
    this.filterCode.set('');
    this.filterDateFrom.set('');
    this.filterDateTo.set('');
    this.sortBy.set('createdAt');
    this.sortOrder.set('desc');
    this.limit.set(20);
    this.page.set(1);
    this.loadList();
  }

  applyFilters() {
    this.page.set(1);
    this.loadList();
  }

  goToPage(page: number) {
    const max = this.meta().pages || 1;
    const safe = Math.max(1, Math.min(max, page));
    if (safe === this.page()) return;
    this.page.set(safe);
    this.loadList();
  }

  onLimitChange(raw: string | number) {
    const parsed = Number(raw);
    this.limit.set(Number.isFinite(parsed) ? parsed : 20);
    this.page.set(1);
    this.loadList();
  }

  showUsedBy(credit: Credit) {
    if (credit.status !== 'used' || !credit.usedBy) {
      this.errorMessage.set('Ce credit n est pas encore utilise.');
      return;
    }

    const usedBy = credit.usedBy;
    if (typeof usedBy === 'string') {
      this.selectedUsedBy.set({ _id: usedBy });
    } else {
      this.selectedUsedBy.set(usedBy);
    }

    this.selectedCreditCode.set(credit.code);
  }

  closeUsedByModal() {
    this.selectedUsedBy.set(null);
    this.selectedCreditCode.set(null);
  }

  userFullName(user: CreditUserSummary) {
    const first = (user.firstName || '').trim();
    const last = (user.lastName || '').trim();
    return `${first} ${last}`.trim() || '-';
  }

  userRoleLabel(user: CreditUserSummary) {
    if (user.role === 'ADMIN') return 'Admin';
    if (user.role === 'BOUTIQUE') return 'Boutique';
    if (user.role === 'USER') return 'Acheteur';
    return '-';
  }

  trackById(_index: number, item: Credit) {
    return item._id;
  }
}
