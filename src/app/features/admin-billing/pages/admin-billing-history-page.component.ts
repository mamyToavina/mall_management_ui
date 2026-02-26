import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AdminBillingTrace, AdminBoutiqueBillingSummary } from '../models/admin-billing.models';
import { AdminBillingApiService } from '../services/admin-billing-api.service';

type HistoryTab = 'analysis' | 'globalTraces';

@Component({
  selector: 'app-admin-billing-history-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-billing-history-page.component.html',
  styleUrl: './admin-billing-history-page.component.css'
})
export class AdminBillingHistoryPageComponent {
  private readonly api = inject(AdminBillingApiService);
  private readonly now = new Date();

  readonly activeTab = signal<HistoryTab>('analysis');

  readonly selectedMonth = signal(this.now.getMonth() + 1);
  readonly selectedYear = signal(this.now.getFullYear());

  readonly loading = signal(false);
  readonly tracesLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly tracesErrorMessage = signal<string | null>(null);

  readonly summaries = signal<AdminBoutiqueBillingSummary[]>([]);
  readonly traces = signal<AdminBillingTrace[]>([]);

  readonly boutiqueSearch = signal('');
  readonly selectedBoutiqueId = signal<string | null>(null);

  readonly traceFromDate = signal(this.toYmd(new Date(this.now.getFullYear(), this.now.getMonth(), 1)));
  readonly traceToDate = signal(this.toYmd(this.now));
  readonly traceBoutiqueId = signal<string>('');

  readonly months = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' }
  ] as const;

  readonly years = computed(() => {
    const currentYear = this.now.getFullYear();
    return [currentYear - 3, currentYear - 2, currentYear - 1, currentYear, currentYear + 1];
  });

  readonly filteredSummaries = computed(() => {
    const q = this.boutiqueSearch().trim().toLowerCase();
    const rows = this.summaries();
    if (!q) return rows;
    return rows.filter((r) => r.boutique.name.toLowerCase().includes(q));
  });

  readonly selectedSummary = computed(() => {
    const id = this.selectedBoutiqueId();
    const rows = this.summaries();
    if (!rows.length) return null;
    if (!id) return rows[0];
    return rows.find((r) => String(r.boutique._id) === id) || rows[0];
  });

  constructor() {
    this.loadSummary();
    this.loadGlobalTraces();
  }

  setTab(tab: HistoryTab) {
    this.activeTab.set(tab);
    if (tab === 'globalTraces' && this.traces().length === 0) {
      this.loadGlobalTraces();
    }
  }

  loadSummary() {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.api.listBoutiquesSummary(this.selectedMonth(), this.selectedYear()).subscribe({
      next: (rows) => {
        const safeRows = rows ?? [];
        this.summaries.set(safeRows);

        const selected = this.selectedBoutiqueId();
        const exists = safeRows.some((r) => String(r.boutique._id) === selected);
        if (!exists) {
          this.selectedBoutiqueId.set(safeRows.length ? String(safeRows[0].boutique._id) : null);
        }

        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message || 'Impossible de charger les analyses boutique.');
        this.loading.set(false);
      }
    });
  }

  loadGlobalTraces() {
    this.tracesLoading.set(true);
    this.tracesErrorMessage.set(null);

    const fromDate = this.traceFromDate();
    const toDate = this.traceToDate();

    this.api
      .listTracesFiltered({
        boutiqueId: this.traceBoutiqueId() || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        month: !fromDate && !toDate ? this.selectedMonth() : undefined,
        year: !fromDate && !toDate ? this.selectedYear() : undefined
      })
      .subscribe({
        next: (rows) => {
          this.traces.set(rows ?? []);
          this.tracesLoading.set(false);
        },
        error: (error) => {
          this.tracesErrorMessage.set(error?.error?.message || 'Impossible de charger les traces globales.');
          this.tracesLoading.set(false);
        }
      });
  }

  pickBoutique(id: string) {
    this.selectedBoutiqueId.set(id);
  }

  toId(value: unknown): string {
    return String(value ?? '');
  }

  isSelectedBoutique(id: unknown): boolean {
    return this.toId(this.selectedSummary()?.boutique?._id) === this.toId(id);
  }

  trackBySummary(_index: number, row: AdminBoutiqueBillingSummary) {
    return row.boutique._id;
  }

  trackByTrace(_index: number, row: AdminBillingTrace) {
    return row._id;
  }

  private toYmd(date: Date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
