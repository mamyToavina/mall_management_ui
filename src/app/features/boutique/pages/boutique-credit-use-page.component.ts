import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthStore } from '../../../core/auth/auth.store';
import { CreditService } from '../../credit/services/credit.service';
import { Credit } from '../../credit/model/credit.model';

@Component({
  selector: 'app-boutique-credit-use-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './boutique-credit-use-page.component.html',
  styleUrl: './boutique-credit-use-page.component.css'
})
export class BoutiqueCreditUsePageComponent {
  private readonly creditService = inject(CreditService);
  private readonly authStore = inject(AuthStore);

  code = signal('');
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  newBalance = signal<number | null>(null);
  usedCredit = signal<Credit | null>(null);
  myHistory = signal<Credit[]>([]);
  historyLoading = signal(false);

  constructor() {
    this.loadHistory();
  }

  submitUseCredit() {
    const normalizedCode = this.code().trim().toUpperCase();
    if (!normalizedCode) {
      this.errorMessage.set('Veuillez saisir un code credit.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.creditService.useCredit(normalizedCode, this.buildIdempotencyKey()).subscribe({
      next: (res) => {
        const payload = res?.data;
        this.usedCredit.set(payload?.credit ?? null);
        const nextBalance = Number(payload?.newBalance);
        if (Number.isFinite(nextBalance)) {
          this.newBalance.set(nextBalance);
          this.authStore.updateUser({ credit: nextBalance });
        } else {
          this.newBalance.set(null);
        }

        const replayed = Boolean(payload?.replayed);
        this.successMessage.set(
          replayed
            ? 'Ce credit a deja ete applique pour cette requete (rejeu idempotent).'
            : 'Credit applique avec succes.'
        );
        this.code.set('');
        this.loadHistory();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Impossible d utiliser ce credit.');
      },
      complete: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  private loadHistory() {
    this.historyLoading.set(true);
    this.creditService.getMyHistory(1, 8).subscribe({
      next: (res) => {
        this.myHistory.set(res?.data ?? []);
      },
      error: () => {
        this.myHistory.set([]);
      },
      complete: () => {
        this.historyLoading.set(false);
      }
    });
  }

  private buildIdempotencyKey() {
    const random =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    return `credit-use-${random}`;
  }
}
