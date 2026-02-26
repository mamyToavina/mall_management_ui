import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { BillingApiService } from '../services/billing-api.service';
import {
  BillingCommissionItem,
  BillingInvoiceDto,
  BillingSummaryDto,
  BillingTraceDto
} from '../models/billing.models';

type BillingTab = 'resume' | 'contrat' | 'commissions' | 'factures' | 'traces';

@Component({
  selector: 'app-boutique-billing-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './boutique-billing-page.component.html',
  styleUrl: './boutique-billing-page.component.css'
})
export class BoutiqueBillingPageComponent {
  private readonly api = inject(BillingApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly assetBaseUrl = environment.apiBaseUrl.replace(/\/api\/?$/, '');

  private readonly now = new Date();

  readonly selectedMonth = signal(this.now.getMonth() + 1);
  readonly selectedYear = signal(this.now.getFullYear());
  readonly activeTab = signal<BillingTab>('resume');

  readonly loading = signal(false);
  readonly detailLoading = signal(false);
  readonly paying = signal<'RENT' | 'ELECTRICITY' | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly summary = signal<BillingSummaryDto | null>(null);
  readonly invoices = signal<BillingInvoiceDto[]>([]);
  readonly traces = signal<BillingTraceDto[]>([]);
  readonly selectedInvoice = signal<BillingInvoiceDto | null>(null);
  readonly selectedCommission = signal<BillingCommissionItem | null>(null);
  readonly showPenaltyDetails = signal(false);

  readonly months = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'F\u00e9vrier' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Ao\u00fbt' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'D\u00e9cembre' }
  ] as const;

  readonly years = computed(() => {
    const currentYear = this.now.getFullYear();
    return [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];
  });

  readonly unpaidOtherMonths = computed(() => {
    const selectedMonth = this.selectedMonth();
    const selectedYear = this.selectedYear();
    const traces = this.traces();

    const perCycle = new Map<string, number>();
    for (const trace of traces) {
      const isRentOrElectricity = trace.category === 'RENT' || trace.category === 'ELECTRICITY';
      const isOtherMonth = trace.month !== selectedMonth || trace.year !== selectedYear;
      if (!isRentOrElectricity || !isOtherMonth) continue;

      const key = `${trace.category}-${trace.month}-${trace.year}`;
      const current = perCycle.get(key) || 0;
      perCycle.set(key, Math.max(current, Number(trace.remainingAmount) || 0));
    }

    return Array.from(perCycle.values()).reduce((sum, value) => sum + value, 0);
  });

  readonly totalToPayExtended = computed(() => {
    const s = this.summary();
    if (!s) return 0;

    return (
      (Number(s.dues.rent.remaining) || 0) +
      (Number(s.dues.electricity.remaining) || 0) +
      (Number(s.penalties.remaining) || 0) +
      this.unpaidOtherMonths()
    );
  });

  readonly contractTimeline = computed(() => {
    const contract = this.summary()?.contract;
    if (!contract) return null;

    const startDate = new Date(contract.startDate);
    const endDate = new Date(contract.endDate);
    const now = new Date();

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return {
        status: 'unknown',
        statusLabel: 'Dates invalides',
        progressPercent: 0,
        totalDays: 0,
        elapsedDays: 0,
        remainingDays: 0
      };
    }

    if (now < startDate) {
      return {
        status: 'not-started',
        statusLabel: 'Non commenc\u00e9',
        progressPercent: 0,
        totalDays: this.diffDays(startDate, endDate),
        elapsedDays: 0,
        remainingDays: this.diffDays(now, endDate)
      };
    }

    if (now >= endDate) {
      const totalDays = this.diffDays(startDate, endDate);
      return {
        status: 'ended',
        statusLabel: 'Termin\u00e9',
        progressPercent: 100,
        totalDays,
        elapsedDays: totalDays,
        remainingDays: 0
      };
    }

    const totalDays = this.diffDays(startDate, endDate);
    const elapsedDays = this.diffDays(startDate, now);
    const remainingDays = this.diffDays(now, endDate);

    return {
      status: 'active',
      statusLabel: 'En cours',
      progressPercent: totalDays > 0 ? Math.round((elapsedDays / totalDays) * 100) : 0,
      totalDays,
      elapsedDays,
      remainingDays
    };
  });

  constructor() {
    this.loadData();
  }

  setTab(tab: BillingTab) {
    this.activeTab.set(tab);
  }

  loadData() {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const month = this.selectedMonth();
    const year = this.selectedYear();

    forkJoin({
      summary: this.api.getMySummary(month, year),
      invoices: this.api.listMyInvoices(month, year),
      traces: this.api.listMyTraces(month, year)
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ summary, invoices, traces }) => {
          this.summary.set(summary);
          this.invoices.set(invoices ?? []);
          this.traces.set(traces ?? []);
          this.loading.set(false);
        },
        error: (error) => {
          this.errorMessage.set(
            error?.error?.message ||
              'Impossible de charger la facturation pour cette p\u00e9riode. Veuillez r\u00e9essayer.'
          );
          this.loading.set(false);
        }
      });
  }

  payNow(type: 'RENT' | 'ELECTRICITY') {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.paying.set(type);

    const month = this.selectedMonth();
    const year = this.selectedYear();
    const request$ =
      type === 'RENT' ? this.api.payRentNow(month, year) : this.api.payElectricityNow(month, year);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.successMessage.set(res.message || 'Paiement effectu\u00e9.');
          this.summary.set(res.summary);
          this.paying.set(null);
          this.loadData();
        },
        error: (error) => {
          this.errorMessage.set(error?.error?.message || 'Paiement impossible.');
          this.paying.set(null);
        }
      });
  }

  openInvoiceDetails(invoice: BillingInvoiceDto) {
    this.detailLoading.set(true);
    this.errorMessage.set(null);

    this.api
      .getMyInvoiceById(invoice._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (value) => {
          this.selectedInvoice.set(value);
          this.detailLoading.set(false);
        },
        error: (error) => {
          this.errorMessage.set(
            error?.error?.message || 'Impossible de r\u00e9cup\u00e9rer les d\u00e9tails de cette facture.'
          );
          this.detailLoading.set(false);
        }
      });
  }

  openCommissionDetails(item: BillingCommissionItem) {
    this.selectedCommission.set(item);
  }

  openPenaltyDetails() {
    this.showPenaltyDetails.set(true);
  }

  closeDetails() {
    this.selectedInvoice.set(null);
    this.selectedCommission.set(null);
    this.showPenaltyDetails.set(false);
  }

  trackByInvoiceId(_index: number, invoice: BillingInvoiceDto) {
    return invoice._id;
  }

  trackByTrace(_index: number, trace: BillingTraceDto) {
    return trace._id;
  }

  invoiceFileUrl(path: string) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${this.assetBaseUrl}${path}`;
  }

  private diffDays(from: Date, to: Date) {
    const dayInMs = 24 * 60 * 60 * 1000;
    const delta = to.getTime() - from.getTime();
    return Math.max(0, Math.ceil(delta / dayInMs));
  }
}
