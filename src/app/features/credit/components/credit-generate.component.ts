import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CreditService } from '../services/credit.service';
import { Credit } from '../model/credit.model';

@Component({
  selector: 'app-credit-generate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: '../pages/credit-generate/credit-generate.component.html',
  styleUrls: ['../pages/credit-generate/credit-generate.component.css'],
})
export class CreditGenerateComponent {
  private creditService = inject(CreditService);
  private router = inject(Router);

  amounts = [20000, 100000, 400000];

  // ✅ “Form” en signals
  value = signal<number>(this.amounts[0]);
  quantity = signal<number>(20);
  adminId = signal<string>('698c2c9cdc19bdaad5d2a9e5');

  loading = signal(false);

  // ✅ validation
  qtyError = computed(() => {
    const q = this.quantity();
    if (!Number.isFinite(q)) return 'Quantité invalide';
    if (q < 1) return 'Min 1';
    if (q > 500) return 'Max 500';
    return null;
  });

  isValid = computed(() => !this.qtyError() && !!this.adminId() && !!this.value());

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

    this.creditService.generateCredit(this.adminId(), this.value(), this.quantity()).subscribe({
      next: (res) => {
        const generated: Credit[] = res.data;
        this.router.navigate(['/credits/print-batch'], { state: { credits: generated } });
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
