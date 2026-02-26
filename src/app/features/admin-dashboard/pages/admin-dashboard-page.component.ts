import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  AdminDashboardDto,
  AdminDashboardStatusPoint
} from '../../admin-billing/models/admin-billing.models';
import { AdminBillingApiService } from '../../admin-billing/services/admin-billing-api.service';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard-page.component.html',
  styleUrl: './admin-dashboard-page.component.css'
})
export class AdminDashboardPageComponent {
  private readonly api = inject(AdminBillingApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly periodDays = signal(30);
  readonly dashboard = signal<AdminDashboardDto | null>(null);
  readonly periodChoices = [7, 30, 90];

  readonly statusTotal = computed(
    () => this.dashboard()?.charts.statusBreakdown.reduce((sum, item) => sum + item.count, 0) ?? 0
  );

  readonly topRevenue = computed(() =>
    Math.max(...(this.dashboard()?.rankings.topRevenueBoutiques.map((row) => row.revenue) ?? [0]))
  );

  constructor() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.api
      .getDashboard(this.periodDays())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.dashboard.set(data);
          this.loading.set(false);
        },
        error: (error) => {
          this.dashboard.set(null);
          this.loading.set(false);
          this.errorMessage.set(error?.error?.message || 'Chargement dashboard admin impossible.');
        }
      });
  }

  changePeriod(days: number) {
    if (days === this.periodDays()) return;
    this.periodDays.set(days);
    this.load();
  }

  statusPercent(item: AdminDashboardStatusPoint) {
    const total = this.statusTotal();
    if (total <= 0) return 0;
    return Math.round((item.count * 1000) / total) / 10;
  }

  revenueWidth(value: number) {
    const max = this.topRevenue();
    if (max <= 0) return 0;
    return Math.round((value / max) * 100);
  }

  statusLabel(status: AdminDashboardStatusPoint['status']) {
    switch (status) {
      case 'SCHEDULED':
        return 'Planifiées';
      case 'PREPARING':
        return 'Préparation';
      case 'READY':
        return 'Prêtes';
      case 'OUT_FOR_DELIVERY':
        return 'Livraison';
      case 'DELIVERED':
        return 'Livrées';
      case 'REJECTED':
        return 'Rejetées';
      default:
        return status;
    }
  }

  statusClass(status: AdminDashboardStatusPoint['status']) {
    return status.toLowerCase();
  }

  trackByStatus(_index: number, item: AdminDashboardStatusPoint) {
    return item.status;
  }
}
