import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { BoxDto } from '../../boxes/models/box.models';
import { BoxesApiService } from '../../boxes/services/box.service';
import { BoutiqueWizardStore } from '../services/wizard/tenant.wizard';

@Component({
  selector: 'app-user-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-step.component.html',
  styleUrls: ['./user-step.component.css']
})
export class UserStepComponent {
  form: FormGroup;

  availableBoxes: BoxDto[] = [];
  boxesLoading = false;
  boxesError = '';
  createdMessage = '';

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private store = inject(BoutiqueWizardStore);
  private boxesApi = inject(BoxesApiService);

  constructor() {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      boxId: ['', [Validators.required]],
    });

    const saved = this.store.getUser();
    if (saved) {
      this.form.patchValue(saved);
    }

    if (this.route.snapshot.queryParamMap.get('created') === '1') {
      this.createdMessage = 'Locataire cree avec succes et email d activation envoye.';
    }

    this.loadFreeBoxes();
  }

  next(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.store.setUser(this.form.getRawValue());
    this.router.navigate(['/admin/tenants/wizard/contract']);
  }

  reloadBoxes(): void {
    this.loadFreeBoxes();
  }

  private loadFreeBoxes(): void {
    this.boxesLoading = true;
    this.boxesError = '';

    this.boxesApi
      .getBoxes({ page: 1, limit: 200, status: '' })
      .subscribe({
        next: (res) => {
          const list = res.data ?? [];
          this.availableBoxes = list.filter((b) => !b.boutique);

          const currentBoxId = this.form.get('boxId')?.value;
          if (currentBoxId && !this.availableBoxes.some((b) => b._id === currentBoxId)) {
            this.form.patchValue({ boxId: '' });
          }

          if (!currentBoxId && this.availableBoxes.length === 1) {
            this.form.patchValue({ boxId: this.availableBoxes[0]._id });
          }

          this.boxesLoading = false;
        },
        error: (err) => {
          this.boxesLoading = false;
          this.boxesError = err?.error?.message || 'Impossible de charger les boxes disponibles.';
        }
      });
  }
}
