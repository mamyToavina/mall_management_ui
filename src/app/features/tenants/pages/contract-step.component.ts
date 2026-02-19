import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BoutiqueWizardStore } from '../services/wizard/tenant.wizard';
import { BoutiqueService } from '../services/tenant.services';

@Component({
  selector: 'app-contract-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contract-step.component.html',
  styleUrls: ['./contract-step.component.css']
})
export class ContractStepComponent {
  submitting = false;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private store: BoutiqueWizardStore,
    private api: BoutiqueService
  ) {
    this.form = this.fb.group({
      startDate: ['', [Validators.required]],
      durationMonths: [3, [Validators.required, Validators.min(3)]],
      monthlyRent: [0, [Validators.required, Validators.min(0)]],
      details: [''],
    });

    if (!this.store.getUser()) {
      this.router.navigate(['/wizard/user']);
      return;
    }

    const saved = this.store.getContract();
    if (saved) this.form.patchValue(saved);
  }

  back(): void {
    this.store.setContract(this.form.getRawValue() as any);
    this.router.navigate(['/wizard/user']);
  }

  submitAll(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const contract = this.form.getRawValue() as any;
    this.store.setContract(contract);

    const dto = this.store.buildDto();

    this.submitting = true;
    this.api.createUserAndContract(dto).subscribe({
      next: () => {
        this.store.clear();
        this.router.navigate(['/wizard/user']); // ou page succès
      },
      error: (err) => {
        console.error(err);
        alert('Échec de création');
      },
      complete: () => (this.submitting = false),
    });
  }
}
