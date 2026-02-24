import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { CreditService } from '../services/credit.service';
import { Credit } from '../model/credit.model';

@Component({
  selector: 'app-credit-generate',
  standalone: true,
  imports: [CommonModule],
  templateUrl: '../pages/credit-generate/credit-generate.component.html',
  styleUrls: ['../pages/credit-generate/credit-generate.component.css']
})
export class CreditGenerateComponent {
  private creditService = inject(CreditService);
  private router = inject(Router);

  readonly amounts = [20000, 100000, 400000];

  value = signal<number>(this.amounts[0]);
  quantity = signal<number>(20);

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  qtyError = computed(() => {
    const q = this.quantity();
    if (!Number.isFinite(q)) return 'Quantite invalide';
    if (q < 1) return 'Min 1';
    if (q > 500) return 'Max 500';
    return null;
  });

  isValid = computed(() => !this.qtyError() && !!this.value());
  total = computed(() => (this.value() ?? 0) * (this.quantity() ?? 0));

  selectAmount(amt: number) {
    this.value.set(amt);
  }

  stepQty(delta: number) {
    const next = this.quantity() + delta;
    this.quantity.set(Math.min(500, Math.max(1, next)));
  }

  reset() {
    this.value.set(this.amounts[0]);
    this.quantity.set(20);
  }

  generate() {
    if (!this.isValid() || this.loading()) return;

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.creditService.generateCredit(this.value(), this.quantity()).subscribe({
      next: (res) => {
        const generated: Credit[] = res.data;
        this.successMessage.set(`${generated.length} credits generes avec succes.`);
        this.router.navigate(['/admin/credits/print-batch'], { state: { credits: generated } });
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message || 'Generation des credits impossible.');
      },
      complete: () => this.loading.set(false)
    });
  }
}
