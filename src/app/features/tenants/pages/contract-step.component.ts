import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { BoutiqueService } from '../services/tenant.services';
import { BoutiqueWizardStore } from '../services/wizard/tenant.wizard';
import { CreateTenantApiResponse } from '../models/tenant.models';

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
  submitError = '';
  submitSuccess = '';
  apiResult: CreateTenantApiResponse | null = null;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private store = inject(BoutiqueWizardStore);
  private api = inject(BoutiqueService);

  constructor() {
    this.form = this.fb.group({
      startDate: ['', [Validators.required]],
      durationMonths: [3, [Validators.required, Validators.min(3)]],
      monthlyRent: [0, [Validators.required, Validators.min(0)]],
      details: [''],
    });

    if (!this.store.getUser()) {
      this.router.navigate(['/admin/tenants/wizard/user']);
      return;
    }

    const saved = this.store.getContract();
    if (saved) {
      this.form.patchValue(saved);
    }
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
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: (res) => {
          this.apiResult = res;
          this.submitSuccess = res.message || 'Locataire cree avec succes.';
          this.store.clear();
        },
        error: (err: Error) => {
          this.submitError = err.message || 'Echec de creation du locataire.';
        },
      });
  }
}
