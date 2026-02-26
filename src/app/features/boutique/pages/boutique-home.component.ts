import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthStore } from '../../../core/auth/auth.store';
import {
  BoutiqueDashboardDto,
  DashboardFulfillmentStatus,
  DashboardStatusPoint
} from '../models/dashboard.models';
import { SalesApiService } from '../services/sales-api.service';

@Component({
  selector: 'app-boutique-home-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './boutique-home.component.html',
  styleUrl: './boutique-home.component.css'
})
export class BoutiqueHomePageComponent {
  private readonly api = inject(SalesApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly store = inject(AuthStore);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly periodDays = signal(30);
  readonly dashboard = signal<BoutiqueDashboardDto | null>(null);

  readonly periodChoices = [7, 30, 90];

  readonly maxRevenue = computed(() =>
    Math.max(...(this.dashboard()?.charts.dailyRevenue.map((point) => point.revenue) ?? [0]))
  );

  readonly totalStatusCount = computed(() =>
    this.dashboard()?.charts.statusBreakdown.reduce((sum, item) => sum + item.count, 0) ?? 0
  );

  readonly revenueSeries = computed(() => {
    const points = this.dashboard()?.charts.dailyRevenue ?? [];
    if (points.length === 0) return '';

    const maxRevenue = Math.max(...points.map((point) => point.revenue), 1);
    const width = 100;
    const height = 36;

    const coords = points.map((point, index) => {
      const x = points.length === 1 ? 0 : (index / (points.length - 1)) * width;
      const y = height - (point.revenue / maxRevenue) * height;
      return `${x},${Math.max(0, Math.min(height, y))}`;
    });

    return coords.join(' ');
  });

  readonly revenueSummary = computed(() => {
    const points = this.dashboard()?.charts.dailyRevenue ?? [];
    if (points.length === 0) {
      return {
        start: 0,
        end: 0,
        peak: 0,
        peakDate: '-'
      };
    }

    const start = points[0]?.revenue ?? 0;
    const end = points[points.length - 1]?.revenue ?? 0;
    const peakPoint = points.reduce((best, point) => (point.revenue > best.revenue ? point : best), points[0]);

    return {
      start,
      end,
      peak: peakPoint.revenue ?? 0,
      peakDate: this.formatShortDate(peakPoint.date)
    };
  });

  readonly topProductMaxRevenue = computed(() =>
    Math.max(...(this.dashboard()?.charts.topProducts.map((item) => item.revenue) ?? [0]))
  );

  constructor() {
    this.loadDashboard();
  }

  changePeriod(days: number) {
    if (days === this.periodDays()) return;
    this.periodDays.set(days);
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.api
      .getBoutiqueDashboard(this.periodDays())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.dashboard.set(res.data);
          this.loading.set(false);
        },
        error: (error) => {
          this.dashboard.set(null);
          this.loading.set(false);
          this.errorMessage.set(error?.error?.message || 'Chargement du dashboard impossible.');
        }
      });
  }

  statusClass(status: DashboardFulfillmentStatus) {
    return status.toLowerCase();
  }

  statusPercent(point: DashboardStatusPoint) {
    const total = this.totalStatusCount();
    if (total <= 0) return 0;
    return Math.round((point.count * 1000) / total) / 10;
  }

  revenueBarHeight(value: number) {
    const max = this.maxRevenue();
    if (max <= 0) return 4;
    return Math.max(4, Math.round((value / max) * 100));
  }

  productRevenueWidth(value: number) {
    const max = this.topProductMaxRevenue();
    if (max <= 0) return 0;
    return Math.round((value / max) * 100);
  }

  formatShortDate(iso: string) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit'
    }).format(date);
  }

  trackByStatus(_index: number, item: DashboardStatusPoint) {
    return item.status;
  }

  trackByDay(_index: number, item: { date: string }) {
    return item.date;
  }

  stars(rating: number) {
    const rounded = Math.max(0, Math.min(5, Math.round(rating)));
    return Array.from({ length: 5 }, (_, index) => index < rounded);
  }
}
