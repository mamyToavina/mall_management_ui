import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { BillingApiService } from '../services/billing-api.service';
import { BillingInvoiceDto, BillingSummaryDto } from '../models/billing.models';

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

  readonly loading = signal(false);
  readonly detailLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly summary = signal<BillingSummaryDto | null>(null);
  readonly invoices = signal<BillingInvoiceDto[]>([]);
  readonly selectedInvoice = signal<BillingInvoiceDto | null>(null);

  readonly months = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Fevrier' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Aout' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Decembre' }
  ] as const;

  readonly years = computed(() => {
    const currentYear = this.now.getFullYear();
    return [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];
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
        statusLabel: 'Non commence',
        progressPercent: 0,
        totalDays: this.diffDays(startDate, endDate),
        elapsedDays: 0,
        remainingDays: this.diffDays(now, endDate)
      };
    }

    if (now >= endDate) {
      return {
        status: 'ended',
        statusLabel: 'Termine',
        progressPercent: 100,
        totalDays: this.diffDays(startDate, endDate),
        elapsedDays: this.diffDays(startDate, endDate),
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

  loadData() {
    this.loading.set(true);
    this.errorMessage.set(null);

    const month = this.selectedMonth();
    const year = this.selectedYear();

    forkJoin({
      summary: this.api.getMySummary(month, year),
      invoices: this.api.listMyInvoices(month, year)
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ summary, invoices }) => {
          this.summary.set(summary);
          this.invoices.set(invoices ?? []);
          this.loading.set(false);
        },
        error: (error) => {
          this.errorMessage.set(
            error?.error?.message ||
              'Impossible de charger la facturation pour cette periode. Veuillez reessayer.'
          );
          this.loading.set(false);
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
            error?.error?.message || 'Impossible de recuperer les details de cette facture.'
          );
          this.detailLoading.set(false);
        }
      });
  }

  closeDetails() {
    this.selectedInvoice.set(null);
  }

  trackByInvoiceId(_index: number, invoice: BillingInvoiceDto) {
    return invoice._id;
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
