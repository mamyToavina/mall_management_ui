import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CreditService } from '../services/credit.service';
import { CreditListQuery, CreditStats } from '../model/credit.model';

@Component({
  selector: 'app-credit-stats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: '../pages/credit-stats/credit-stats.component.html',
  styleUrls: ['../pages/credit-stats/credit-stats.component.css']
})
export class CreditStatsComponent {
  private creditService = inject(CreditService);

  readonly amounts = [20000, 100000, 400000];
  readonly statusOptions = ['active', 'used', 'expired'] as const;

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  stats = signal<CreditStats | null>(null);

  filterStatus = signal<'' | 'active' | 'used' | 'expired'>('');
  filterValue = signal<number | ''>('');
  filterDateFrom = signal('');
  filterDateTo = signal('');

  constructor() {
    this.loadStats();
  }

  private buildQuery(): CreditListQuery {
    return {
      status: this.filterStatus(),
      value: this.filterValue(),
      dateFrom: this.filterDateFrom() || undefined,
      dateTo: this.filterDateTo() || undefined
    };
  }

  loadStats() {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.creditService.getStats(this.buildQuery()).subscribe({
      next: (res) => {
        this.stats.set(res.data ?? null);
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message || 'Impossible de charger les statistiques.');
      },
      complete: () => this.loading.set(false)
    });
  }

  resetFilters() {
    this.filterStatus.set('');
    this.filterValue.set('');
    this.filterDateFrom.set('');
    this.filterDateTo.set('');
    this.loadStats();
  }

  trackByStatus(_index: number, item: { _id: string }) {
    return item._id;
  }

  trackByValue(_index: number, item: { _id: number }) {
    return item._id;
  }
}
