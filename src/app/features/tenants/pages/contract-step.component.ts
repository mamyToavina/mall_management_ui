import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { BoutiqueService } from '../services/tenant.services';
import { BoutiqueWizardStore } from '../services/wizard/tenant.wizard';
import { CreateTenantApiResponse } from '../models/tenant.models';

const MAX_AMOUNT = 1000000000;
const MAX_FACTOR = 1000;
const MAX_DURATION_MONTHS = 240;

@Component({
  selector: 'app-contract-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contract-step.component.html',
  styleUrls: ['./contract-step.component.css']
})
export class ContractStepComponent {
  form: FormGroup;

  submitting = false;
  loadingDefaults = false;
  submitError = '';
  submitSuccess = '';
  apiResult: CreateTenantApiResponse | null = null;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private store = inject(BoutiqueWizardStore);
  private api = inject(BoutiqueService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    this.form = this.fb.group({
      startDate: ['', [Validators.required]],
      durationMonths: [3, [Validators.required, Validators.min(1), Validators.max(MAX_DURATION_MONTHS)]],
      monthlyRent: [0, [Validators.required, Validators.min(0), Validators.max(MAX_AMOUNT)]],
      penaltyFee: [0, [Validators.required, Validators.min(0), Validators.max(MAX_AMOUNT)]],
      penaltyGrowthFactor: [1, [Validators.required, Validators.min(0), Validators.max(MAX_FACTOR)]],
      terminationFee: [0, [Validators.required, Validators.min(0), Validators.max(MAX_AMOUNT)]],
      onlineSalesCommissionPercent: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      notes: ['', [Validators.maxLength(1000)]],
    });

    const userDraft = this.store.getUser();
    if (!userDraft) {
      this.router.navigate(['/admin/tenants/wizard/user']);
      return;
    }

    const saved = this.store.getContract();
    if (saved) {
      this.form.patchValue(saved);
    } else {
      this.form.patchValue({
        monthlyRent: userDraft.selectedBoxMonthlyRent ?? 0
      });
    }

    this.loadDefaults();
  }

  back(): void {
    this.store.setContract(this.form.getRawValue());
    this.router.navigate(['/admin/tenants/wizard/user']);
  }

  createAnother(): void {
    this.router.navigate(['/admin/tenants/wizard/user'], {
      queryParams: { created: '1' }
    });
  }

  submitAll(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitError = '';
    this.submitSuccess = '';

    this.store.setContract(this.form.getRawValue());
    const dto = this.store.buildDto();

    this.submitting = true;
    this.api
      .createUserAndContract(dto)
      .subscribe({
        next: (res) => {
          this.submitting = false;
          this.apiResult = res;
          this.submitSuccess = res.message || 'Locataire créé avec succès.';
          this.store.clear();
          this.cdr.detectChanges();
        },
        error: (err: Error) => {
          this.submitting = false;
          this.submitError = err.message || 'Échec de création du locataire.';
          this.cdr.detectChanges();
        },
      });
  }

  private loadDefaults(): void {
    this.loadingDefaults = true;

    this.api.getGeneralSettings()
      .subscribe({
        next: (settings) => {
          this.loadingDefaults = false;
          const saved = this.store.getContract();
          if (saved) return;

          this.form.patchValue({
            penaltyFee: settings.defaultPenaltyFee ?? 0,
            penaltyGrowthFactor: settings.penaltyGrowthFactor > 0 ? settings.penaltyGrowthFactor : 1,
            terminationFee: settings.defaultTerminationFee ?? 0,
            onlineSalesCommissionPercent: settings.defaultOnlineSalesCommissionPercent ?? 0
          });
          this.cdr.detectChanges();
        },
        error: () => {
          this.loadingDefaults = false;
          const saved = this.store.getContract();
          if (!saved) {
            this.form.patchValue({ penaltyGrowthFactor: 1 });
          }
          this.cdr.detectChanges();
        }
      });
  }

  formatInteger(value: unknown): string {
    const n = Number(value);
    if (!Number.isFinite(n)) return '';
    return Math.trunc(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  onIntegerInput(controlName: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = (input.value || '').replace(/\D/g, '');
    const value = digits ? Number(digits) : null;
    this.form.get(controlName)?.setValue(value, { emitEvent: false });
    input.value = digits ? this.formatInteger(value) : '';
  }
}
