import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { BoutiqueService } from '../services/tenant.services';

const MAX_AMOUNT = 1000000000;
const MAX_FACTOR = 1000;

@Component({
  selector: 'app-general-settings-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './general-settings-page.component.html',
  styleUrls: ['./general-settings-page.component.css']
})
export class GeneralSettingsPageComponent {
  form: FormGroup;
  loading = false;
  submitting = false;
  error = '';
  success = '';

  private fb = inject(FormBuilder);
  private api = inject(BoutiqueService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    this.form = this.fb.group({
      mallAddress: ['', [Validators.maxLength(300)]],
      mallLatitude: [0, [Validators.min(-90), Validators.max(90)]],
      mallLongitude: [0, [Validators.min(-180), Validators.max(180)]],
      defaultPenaltyFee: [0, [Validators.required, Validators.min(0), Validators.max(MAX_AMOUNT)]],
      penaltyGrowthFactor: [1, [Validators.required, Validators.min(0), Validators.max(MAX_FACTOR)]],
      defaultTerminationFee: [0, [Validators.required, Validators.min(0), Validators.max(MAX_AMOUNT)]],
      defaultOnlineSalesCommissionPercent: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });

    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.api.getGeneralSettings()
      .subscribe({
        next: (settings) => {
          this.loading = false;
          this.form.patchValue({
            ...settings,
            penaltyGrowthFactor: settings.penaltyGrowthFactor > 0 ? settings.penaltyGrowthFactor : 1
          });
          this.cdr.detectChanges();
        },
        error: (err: Error) => {
          this.loading = false;
          this.error = err.message || 'Impossible de charger le paramétrage général.';
          this.cdr.detectChanges();
        }
      });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = '';
    this.success = '';

    this.api.updateGeneralSettings(this.form.getRawValue())
      .subscribe({
        next: (res) => {
          this.submitting = false;
          this.success = res.message || 'Paramétrage mis à jour.';
          this.form.patchValue({
            ...res.settings,
            penaltyGrowthFactor: (res.settings?.penaltyGrowthFactor ?? 0) > 0
              ? res.settings.penaltyGrowthFactor
              : 1
          });
          this.cdr.detectChanges();
        },
        error: (err: Error) => {
          this.submitting = false;
          this.error = err.message || 'Échec de la mise à jour.';
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
